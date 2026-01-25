import { Router } from 'express';
import { GeminiService } from '../services/gemini.js';
import { OpenAPIParser } from '../utils/openapi-parser.js';
import { APIProxy } from '../middleware/proxy.js';
import prisma from '../lib/prisma.js';

const router = Router();

// GET all products
router.get('/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error: any) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET single product
router.get('/products/:productId', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.productId }
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error: any) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: error.message });
    }
});

// Configuration endpoint - create/update product
router.post('/config/:productId', async (req, res) => {
    const { productId } = req.params;
    const { name, openApiUrl, baseUrl } = req.body;

    try {
        const product = await prisma.product.upsert({
            where: { id: productId },
            update: { name, openApiUrl, baseUrl },
            create: {
                id: productId,
                name: name || productId,
                openApiUrl,
                baseUrl
            }
        });
        res.json({ success: true, product });
    } catch (error: any) {
        console.error('Error saving product:', error);
        res.status(500).json({ error: error.message });
    }
});

// Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message, productId, sessionId, userToken } = req.body;

        // Get product configuration from database
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
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

        return res.json({
            response: responseText,
            functionsCalled: functionsCalled.length > 0 ? functionsCalled : undefined
        });

    } catch (error: any) {
        console.error('Chat error:', error);

        // Track error
        try {
            await prisma.analyticsEvent.create({
                data: {
                    productId: req.body.productId || 'unknown',
                    eventType: 'error',
                    metadata: { error: error.message, sessionId: req.body.sessionId }
                }
            });
        } catch (e) {
            // Ignore analytics error
        }

        res.status(500).json({ error: error.message });
    }
});

// Get analytics
router.get('/analytics/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { startDate, endDate } = req.query;

        const events = await prisma.analyticsEvent.findMany({
            where: {
                productId,
                ...(startDate && endDate ? {
                    createdAt: {
                        gte: new Date(startDate as string),
                        lte: new Date(endDate as string)
                    }
                } : {})
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        // Aggregate stats
        const stats = await prisma.analyticsEvent.groupBy({
            by: ['eventType'],
            where: { productId },
            _count: true
        });

        res.json({ events, stats });
    } catch (error: any) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get messages for a session
router.get('/messages/:sessionId', async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            where: { sessionId: req.params.sessionId },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error: any) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
