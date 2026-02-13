import prisma from "../lib/prisma.js";
import { getLLMService } from "./llm.js";
import { OpenAPIParser } from "../utils/openapi-parser.js";
import { APIProxy } from "../middleware/proxy.js";
import { Logger } from "../utils/logger.js";
import { KnowledgeService } from "./knowledge.js";

const logger = new Logger();
const knowledgeService = new KnowledgeService();

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
    const serverTools = parser.generateTools(spec);

    // Merge with client-side tools
    const clientTools = (product.clientSideTools as any[]) || [];
    // Convert client tools to Gemini format
    const formattedClientTools = clientTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));

    // Add Knowledge Base tool
    const knowledgeTool = {
      name: "queryKnowledgeBase",
      description:
        "Query the product knowledge base for context when you need more information to answer the user's question.",
      parameters: {
        type: "object",
        properties: {
          queries: {
            type: "array",
            description:
              "List of specific queries to search for in the knowledge base.",
            items: { type: "string" },
          },
        },
        required: ["queries"],
      },
    };

    const tools = [...serverTools, ...formattedClientTools, knowledgeTool];

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
      // Execute function calls via proxy or internal handlers
      const apiBaseUrl = spec.servers?.[0]?.url || product.baseUrl;
      const proxy = new APIProxy(apiBaseUrl, spec);
      const functionResults = [];
      const clientToolNames = new Set(clientTools.map((t) => t.name));

      for (const call of result.functionCalls!) {
        // Handle Knowledge Base query
        if (call.name === "queryKnowledgeBase") {
          logger.info(
            `Querying knowledge base with: ${JSON.stringify(call.args)}`,
          );
          const queries = call.args.queries || [];
          let context = "";

          if (Array.isArray(queries) && queries.length > 0) {
            // Execute all queries in parallel
            const searchResults = await Promise.all(
              queries.map((q) => knowledgeService.search(productId, q)),
            );

            // Deduplicate results based on ID/content?
            // For now just aggregate.
            const uniqueResults = new Map();
            searchResults.flat().forEach((r) => {
              if (!uniqueResults.has(r.id)) {
                uniqueResults.set(r.id, r);
              }
            });

            context = Array.from(uniqueResults.values())
              .map((r: any) => `[Source: ${r.metadata.name}]\n${r.text}`)
              .join("\n\n");
          }

          const response = {
            context: context || "No relevant information found.",
          };

          functionResults.push({
            toolCallId: call.toolCallId,
            functionResponse: {
              name: call.name,
              response,
            },
          });

          functionsCalled.push({
            name: call.name,
            args: call.args,
            response,
          });
          continue;
        }

        // Check if this is a client-side tool
        if (clientToolNames.has(call.name)) {
          // For client-side tools, we just pass the call info back to the client
          // The widget will execute it and (optionally) send results back
          logger.info(`Client-side tool called: ${call.name}`);

          functionsCalled.push({
            name: call.name,
            args: call.args,
            response: {}, // No response yet, client will execute
          });

          // We don't add to functionResults here because we can't continue the chat immediately
          // The client needs to intervene
          continue;
        }

        const execResult = await proxy.executeFunction(
          call.name,
          call.args,
          userToken,
        );

        functionResults.push({
          toolCallId: call.toolCallId,
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

      // If we only have client-side tools, we return early so the widget can execute them
      if (
        functionsCalled.length > 0 &&
        functionsCalled.every((f) => clientToolNames.has(f.name))
      ) {
        // Save assistant message with tool calls
        await prisma.message.create({
          data: {
            productId,
            sessionId,
            role: "assistant",
            content: "", // Empty content as it's a pure tool call
            functionsCalled: functionsCalled as any,
            toolCalls: {
              create: functionsCalled.map((f) => ({
                name: f.name,
                args: f.args || {},
                result: {}, // Empty object instead of null for Prisma Json
              })),
            },
          },
        });

        return {
          response: "", // No text response
          functionsCalled,
        };
      }

      // Continue chat with function results (only for server-side tools)
      if (functionResults.length > 0) {
        logger.debug(
          `Continuing chat with ${functionResults.length} function results`,
        );
        const finalResult = await llm.continueWithFunctionResult(
          result.chat,
          functionResults,
        );

        responseText = finalResult.text;
      } else {
        // Should not happen if logic is correct, but fallback
        responseText = "Waiting for client action...";
      }

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
