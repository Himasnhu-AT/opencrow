import prisma from "../lib/prisma.js";
import { getLLMService } from "./llm.js";
import { OpenAPIParser } from "../utils/openapi-parser.js";
import { APIProxy } from "../middleware/proxy.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger();

export class ChatService {
  public async processChat(
    message: string,
    productId: string,
    sessionId: string,
    userToken?: string,
  ) {
    logger.info(
      `Processing chat for product: ${productId}, session: ${sessionId}`,
    );

    // Get product configuration from database
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      logger.warn(`Product not found: ${productId}`);
      throw new Error("Product not found");
    }

    // Initialize LLM (Gemini or Ollama based on env)
    const llm = getLLMService();
    logger.debug(`LLM service initialized`);

    // Get or create session from database
    let session = await prisma.session.findUnique({
      where: { sessionId },
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
        role: "user",
        content: message,
      },
    });

    // Track analytics
    await prisma.analyticsEvent.create({
      data: {
        productId,
        eventType: "chat_message",
        metadata: { sessionId },
      },
    });

    // Send message to LLM
    logger.debug(`Sending message to LLM with ${tools.length} tools`);
    const result = await llm.chat(
      message,
      [{ functionDeclarations: tools }],
      history,
    );

    let responseText: string;
    let functionsCalled: Array<{ name: string; args: any; response: any }> = [];

    if (result.type === "function_call") {
      // Execute function calls via proxy
      // Use server URL from OpenAPI spec (includes /api path) or fall back to product.baseUrl
      const apiBaseUrl = spec.servers?.[0]?.url || product.baseUrl;
      const proxy = new APIProxy(apiBaseUrl, spec);
      const functionResults = [];

      for (const call of result.functionCalls!) {
        const execResult = await proxy.executeFunction(
          call.name,
          call.args,
          userToken,
        );

        functionResults.push({
          functionResponse: {
            name: call.name,
            response: execResult,
          },
        });

        functionsCalled.push({
          name: call.name,
          args: call.args,
          response: execResult,
        });
      }

      // Track function calls
      await prisma.analyticsEvent.create({
        data: {
          productId,
          eventType: "function_called",
          metadata: {
            functions: functionsCalled.map((f) => f.name),
            sessionId,
          },
        },
      });

      // Continue chat with function results
      logger.debug(
        `Continuing chat with ${functionResults.length} function results`,
      );
      const finalResult = await llm.continueWithFunctionResult(
        result.chat,
        functionResults,
      );

      responseText = finalResult.text;

      // Update session history
      const newHistory = await result.chat.getHistory();
      await prisma.session.upsert({
        where: { sessionId },
        update: { history: newHistory, productId },
        create: { sessionId, productId, history: newHistory },
      });
    } else {
      // Text response
      responseText = result.text || "";
      const newHistory = await result.chat.getHistory();
      await prisma.session.upsert({
        where: { sessionId },
        update: { history: newHistory, productId },
        create: { sessionId, productId, history: newHistory },
      });
    }

    // Save assistant message
    await prisma.message.create({
      data: {
        productId,
        sessionId,
        role: "assistant",
        content: responseText,
        functionsCalled:
          functionsCalled.length > 0 ? (functionsCalled as any) : undefined, // Keep for legacy
        toolCalls: {
          create: functionsCalled.map((f) => ({
            name: f.name,
            args: f.args || {},
            result: f.response || {},
          })),
        },
      },
    });

    // Return the response with rich function calls
    return {
      response: responseText,
      functionsCalled: functionsCalled.length > 0 ? functionsCalled : undefined,
    };
  }

  public async getSessionMessages(sessionId: string) {
    return prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      include: {
        toolCalls: true,
      },
    });
  }

  public async getProductSessions(productId: string) {
    const sessions = await prisma.session.findMany({
      where: { productId },
      orderBy: { updatedAt: "desc" },
      take: 50, // Limit to 50 most recent sessions
    });

    // Fetch the last message for each session to display as preview
    const sessionsWithDetails = await Promise.all(
      sessions.map(async (session) => {
        const lastMessage = await prisma.message.findFirst({
          where: { sessionId: session.sessionId },
          orderBy: { createdAt: "desc" },
        });

        return {
          sessionId: session.sessionId,
          lastMessage: lastMessage?.content || "No messages yet",
          dateTime: session.updatedAt,
          status: "active" as const, // For now, all sessions are considered active
        };
      }),
    );

    return sessionsWithDetails;
  }
}
