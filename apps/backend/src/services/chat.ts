import prisma from '../lib/prisma.js';
import { GeminiService } from './gemini.js';
import { OpenAPIParser } from '../utils/openapi-parser.js';
import { APIProxy } from '../middleware/proxy.js';

export class ChatService {
    public async processChat(
        message: string,
        productId: string,
        sessionId: string,
        userToken?: string
    ) {
        // Get product configuration from database
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            throw new Error('Product not found');
        }

        // Initialize Gemini
        const gemini = new GeminiService(process.env.GEMINI_API_KEY!);

        // Get or create session from database
        let session = await prisma.session.findUnique({
            where: { sessionId }
        });

        const history = session ? (session.history as any[]) : [];

        // Generate tools from OpenAPI spec
        const parser = new OpenAPIParser();
        const spec = await parser.parseSpec(product.openApiUrl);
        const tools = parser.generateTools(spec);

        // Save user message
        await prisma.message.create({
            data: {
                productId,
                sessionId,
                role: 'user',
                content: message
            }
        });

        // Track analytics
        await prisma.analyticsEvent.create({
            data: {
                productId,
                eventType: 'chat_message',
                metadata: { sessionId }
            }
        });

        // Send message to Gemini
        const result = await gemini.chat(message, [{ functionDeclarations: tools }], history);

        let responseText: string;
        let functionsCalled: string[] = [];

        if (result.type === 'function_call') {
            // Execute function calls via proxy
            const proxy = new APIProxy(product.baseUrl, spec);
            const functionResults = [];

            for (const call of result.functionCalls!) {
                const execResult = await proxy.executeFunction(
                    call.name,
                    call.args,
                    userToken
                );

                functionResults.push({
                    functionResponse: {
                        name: call.name,
                        response: execResult
                    }
                });

                functionsCalled.push(call.name);
            }

            // Track function calls
            await prisma.analyticsEvent.create({
                data: {
                    productId,
                    eventType: 'function_called',
                    metadata: { functions: functionsCalled, sessionId }
                }
            });

            // Continue chat with function results
            const finalResult = await gemini.continueWithFunctionResult(
                result.chat,
                functionResults
            );

            responseText = finalResult.text;

            // Update session history
            const newHistory = await result.chat.getHistory();
            await prisma.session.upsert({
                where: { sessionId },
                update: { history: newHistory, productId },
                create: { sessionId, productId, history: newHistory }
            });
        } else {
            // Text response
            responseText = result.text;
            const newHistory = await result.chat.getHistory();
            await prisma.session.upsert({
                where: { sessionId },
                update: { history: newHistory, productId },
                create: { sessionId, productId, history: newHistory }
            });
        }

        // Save assistant message
        await prisma.message.create({
            data: {
                productId,
                sessionId,
                role: 'assistant',
                content: responseText,
                functionsCalled: functionsCalled.length > 0 ? functionsCalled : undefined
            }
        });

        return {
            response: responseText,
            functionsCalled: functionsCalled.length > 0 ? functionsCalled : undefined
        };
    }

    public async getSessionMessages(sessionId: string) {
        return prisma.message.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' }
        });
    }
}
