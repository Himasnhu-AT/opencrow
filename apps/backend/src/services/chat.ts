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

    // Add auth tools if product has authentication configured
    if (product.authType && product.authType !== "none") {
      tools.push({
        name: "request_login",
        description:
          "Call this tool if the user needs to authenticate or log in, or if the user is unauthenticated and tries to perform an action that requires authentication.",
        parameters: {
          type: "object",
          properties: {},
        },
      });
    }

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
    logger.debug(
      `Tools available: ${tools.map((t: any) => t.name).join(", ")}`,
    );
    // Initial LLM call
    let result = await llm.chat(
      message,
      [{ functionDeclarations: tools }],
      history,
    );

    let responseText: string = "";
    let allFunctionsCalled: Array<{
      name: string;
      args: any;
      response: any;
    }> = [];

    // Loop to handle sequential function calls (max depth to prevent infinite loops)
    let depth = 0;
    const MAX_DEPTH = 5;

    while (result.type === "function_call" && depth < MAX_DEPTH) {
      depth++;
      const functionsCalledInThisTurn: Array<{
        name: string;
        args: any;
        response: any;
      }> = [];
      const functionResults = [];

      // Execute all function calls in this turn
      const apiBaseUrl = spec.servers?.[0]?.url || product.baseUrl;
      const proxy = new APIProxy(apiBaseUrl, spec);
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

            // Deduplicate results based on ID
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

          functionsCalledInThisTurn.push({
            name: call.name,
            args: call.args,
            response,
          });
          continue;
        }

        // Check if this is a client-side tool or the special auth tool
        if (clientToolNames.has(call.name) || call.name === "request_login") {
          logger.info(`Client-side tool called: ${call.name}`);
          functionsCalledInThisTurn.push({
            name: call.name,
            args: call.args,
            response: {}, // Client will execute
          });
          // We can't continue server-side loop if client tool is needed
          // So we break the loop and return what we have so far
          // The client will handle its tool and potentially call backend again
          // TODO: This might need better state management for mixed chains
        } else {
          try {
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

            functionsCalledInThisTurn.push({
              name: call.name,
              args: call.args,
              response: execResult,
            });
          } catch (error: any) {
            // Include error in function result so LLM can react (e.g. 401 -> login)
            const errorResponse = { error: error.message || "Unknown error" };
            functionResults.push({
              toolCallId: call.toolCallId,
              functionResponse: {
                name: call.name,
                response: errorResponse,
              },
            });
            functionsCalledInThisTurn.push({
              name: call.name,
              args: call.args,
              response: errorResponse,
            });
          }
        }
      }

      // Add to total tracking
      allFunctionsCalled = [
        ...allFunctionsCalled,
        ...functionsCalledInThisTurn,
      ];

      // If we have any client-side tools in this turn, we must stop and let client handle them
      if (functionsCalledInThisTurn.some((f) => clientToolNames.has(f.name))) {
        break;
      }

      // If no server-side results to report back, we are done
      if (functionResults.length === 0) {
        break;
      }

      // Continue chat with results
      logger.debug(
        `Continuing chat (depth ${depth}) with ${functionResults.length} function results`,
      );

      // Pass the updated chat object from previous result
      result = await llm.continueWithFunctionResult(
        result.chat,
        functionResults,
      );
    }

    if (result.type === "text") {
      responseText = result.text || "";
    } else {
      // If we ended deeply nested or with client tools, we might not have text
      // If client tools were last, responseText remains empty and handled by frontend
      if (!responseText && allFunctionsCalled.length === 0) {
        responseText = "I'm not sure how to proceed.";
      }
    }

    // Track all function calls
    if (allFunctionsCalled.length > 0) {
      await prisma.analyticsEvent.create({
        data: {
          productId,
          eventType: "function_called",
          metadata: {
            functions: allFunctionsCalled.map((f) => f.name),
            sessionId,
          },
        },
      });
    }

    // Handle special case: Client-side tools ending the chain
    const clientToolNames = new Set(clientTools.map((t) => t.name));
    const lastTurnCalls = allFunctionsCalled.slice(-1); // Simplification, ideally track turns
    const lastWasClientTool = lastTurnCalls.some(
      (f) => clientToolNames.has(f.name) || f.name === "request_login",
    );

    if (lastWasClientTool && !responseText) {
      // Save assistant message with tool calls
      await prisma.message.create({
        data: {
          productId,
          sessionId,
          role: "assistant",
          content: "",
          functionsCalled: allFunctionsCalled as any,
          toolCalls: {
            create: allFunctionsCalled.map((f) => ({
              name: f.name,
              args: f.args || {},
              result: f.response || {},
            })),
          },
        },
      });

      return {
        response: "",
        functionsCalled: allFunctionsCalled,
      };
    }

    // Save final response
    const newHistory = await result.chat.getHistory();
    await prisma.session.upsert({
      where: { sessionId },
      update: { history: newHistory, productId },
      create: { sessionId, productId, history: newHistory },
    });

    await prisma.message.create({
      data: {
        productId,
        sessionId,
        role: "assistant",
        content: responseText,
        functionsCalled:
          allFunctionsCalled.length > 0
            ? (allFunctionsCalled as any)
            : undefined,
        toolCalls: {
          create: allFunctionsCalled.map((f) => ({
            name: f.name,
            args: f.args || {},
            result: f.response || {},
          })),
        },
      },
    });

    return {
      response: responseText,
      functionsCalled:
        allFunctionsCalled.length > 0 ? allFunctionsCalled : undefined,
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
      sessions.map(async (session: any) => {
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
