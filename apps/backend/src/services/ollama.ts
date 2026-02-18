import axios from "axios";
import { Tool } from "@google/generative-ai";
import { LLMService, LLMChatResult, LLMTextResult } from "./llm.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger();

/**
 * Ollama service for local LLM inference
 * Supports function calling via structured prompts
 */
export class OllamaService implements LLMService {
  private baseUrl: string;
  private model: string;
  private systemPrompt: string;

  constructor(baseUrl: string, model: string) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.systemPrompt = `You are a smart AI assistant using the ReACT (Reasoning, Acting) pattern.
You help users accomplish tasks by calling available API functions.

You have access to the following tools.

To use a tool, please use the following format:

Thought: Do I need to use a tool? Yes
Action: the action to take, should be a JSON object in this exact format: {"function_call": {"name": "function_name", "arguments": {...}}}
Observation: the result of the action

When you have a response to say to the Human, or if you do not need to use a tool, you MUST use the format:

Thought: Do I need to use a tool? No
Final Answer: [your response here]

Example:
Thought: The user wants to check orders. I need to list them.
Action: {"function_call": {"name": "listOrders", "arguments": {}}}
Observation: 401 Unauthorized
Thought: The user is not logged in. I need to ask them to login.
Action: {"function_call": {"name": "request_login", "arguments": {}}}
Observation: Login requested
Thought: I have requested login.
Final Answer: Please log in to view your orders.`;

    logger.info(`OllamaService initialized with model: ${model} at ${baseUrl}`);
  }

  async chat(
    message: string,
    tools: Tool[],
    history: any[] = [],
  ): Promise<LLMChatResult> {
    logger.debug(`Ollama chat request: ${message.substring(0, 100)}...`);

    const supportsTools = await this.checkToolSupport();

    // Build messages array from history
    const messages = this.buildMessages(
      history,
      message,
      supportsTools ? [] : tools,
    );

    try {
      const requestBody: any = {
        model: this.model,
        messages,
        stream: false,
        options: {
          temperature: 0.7,
          stop: ["Observation:"],
        },
      };

      if (supportsTools && tools.length > 0) {
        requestBody.tools = this.formatToolsForOllama(tools);
      }

      const response = await axios.post(
        `${this.baseUrl}/api/chat`,
        requestBody,
      );

      const content = response.data.message.content;
      const toolCalls = response.data.message.tool_calls;

      logger.debug(`Ollama response: ${content.substring(0, 200)}...`);

      if (toolCalls && toolCalls.length > 0) {
        logger.info(`Ollama tool calls detected:`, toolCalls);
        return {
          type: "function_call",
          functionCalls: toolCalls.map((tc: any) => ({
            name: tc.function.name,
            args: tc.function.arguments,
            toolCallId: tc.tool_call_id,
          })),
          chat: {
            history: [...messages, response.data.message],
            getHistory: async () => [...messages, response.data.message],
            tools: supportsTools ? [] : tools,
          },
        };
      }

      // Try to parse function call from response for older models
      const functionCall = this.parseFunctionCall(content);

      if (functionCall) {
        logger.info(`Ollama function call detected: ${functionCall.name}`);
        return {
          type: "function_call",
          functionCalls: [functionCall],
          chat: {
            history: [...messages, { role: "assistant", content }],
            getHistory: async () => [
              ...messages,
              { role: "assistant", content },
            ],
            tools,
          },
        };
      }

      return {
        type: "text",
        text: content,
        chat: {
          history: [...messages, { role: "assistant", content }],
          getHistory: async () => [...messages, { role: "assistant", content }],
          tools,
        },
      };
    } catch (error: any) {
      logger.error(`Ollama chat error: ${error.message}`);
      throw new Error(`Ollama API error: ${error.message}`);
    }
  }

  async continueWithFunctionResult(
    chat: any,
    functionResults: any[],
  ): Promise<LLMChatResult> {
    logger.debug(
      `Ollama continue with ${functionResults.length} function results`,
    );

    const newMessages = functionResults.map((r) => ({
      role: "user",
      content: `Observation: ${JSON.stringify(r.functionResponse.response)}`,
    }));

    const messages = [
      ...chat.history,
      ...newMessages,
      {
        role: "system",
        content:
          "Observation received. Continue with your Thought and Action loop. If the specific error '401 Unauthorized' or 'No token provided' occurred, you MUST call the 'request_login' tool immediately.",
      },
    ];

    try {
      const response = await axios.post(`${this.baseUrl}/api/chat`, {
        model: this.model,
        messages,
        stream: false,
        tools: chat.tools, // Pass tools if available in chat context (need to store them)
        options: {
          stop: ["Observation:"],
        },
      });

      const content = response.data.message.content;
      const toolCalls = response.data.message.tool_calls;

      logger.debug(
        `Ollama follow-up response: ${content.substring(0, 200)}...`,
      );

      if (toolCalls && toolCalls.length > 0) {
        logger.info(`Ollama follow-up tool calls detected:`, toolCalls);
        return {
          type: "function_call",
          functionCalls: toolCalls.map((tc: any) => ({
            name: tc.function.name,
            args: tc.function.arguments,
            toolCallId: tc.tool_call_id,
          })),
          chat: {
            history: [...messages, response.data.message],
            getHistory: async () => [...messages, response.data.message],
            tools: chat.tools,
          },
        };
      }

      // Try parsing legacy function call format
      const functionCall = this.parseFunctionCall(content);
      if (functionCall) {
        logger.info(
          `Ollama follow-up function call detected: ${functionCall.name}`,
        );
        return {
          type: "function_call",
          functionCalls: [functionCall],
          chat: {
            history: [...messages, { role: "assistant", content }],
            getHistory: async () => [
              ...messages,
              { role: "assistant", content },
            ],
            tools: chat.tools,
          },
        };
      }

      return {
        type: "text",
        text: content,
        chat: {
          history: [...messages, { role: "assistant", content }],
          getHistory: async () => [...messages, { role: "assistant", content }],
          tools: chat.tools,
        },
      };
    } catch (error: any) {
      throw new Error(`Ollama API error: ${error.message}`);
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/embeddings`, {
        model: this.model,
        prompt: text,
      });
      return response.data.embedding;
    } catch (error: any) {
      console.error("Error generating embedding with Ollama:", error.message);
      throw error;
    }
  }

  private buildMessages(history: any[], message: string, tools: Tool[]) {
    // Convert tools to a readable format for the prompt
    const toolsDescription = this.formatToolsForPrompt(tools);

    const messages: any[] = [
      {
        role: "system",
        content: `${this.systemPrompt}\n\nAvailable functions:\n${toolsDescription}`,
      },
    ];

    // Add history (convert from Gemini format if needed)
    for (const item of history) {
      if (item.role && item.content) {
        messages.push({ role: item.role, content: item.content });
      } else if (item.role && item.parts) {
        // Gemini format
        const content = item.parts
          .map((p: any) => p.text || JSON.stringify(p))
          .join(" ");
        messages.push({
          role: item.role === "model" ? "assistant" : item.role,
          content,
        });
      }
    }

    messages.push({ role: "user", content: message });

    return messages;
  }

  private formatToolsForPrompt(tools: Tool[]): string {
    if (!tools || tools.length === 0) return "No functions available.";

    const declarations = tools.flatMap(
      (t) => (t as any).functionDeclarations || [],
    );

    return declarations
      .map((fn: any) => {
        const params = fn.parameters?.properties
          ? Object.entries(fn.parameters.properties)
              .map(
                ([name, schema]: [string, any]) =>
                  `  - ${name}: ${schema.type} - ${schema.description || ""}`,
              )
              .join("\n")
          : "  No parameters";

        return `- ${fn.name}: ${fn.description || "No description"}\n  Parameters:\n${params}`;
      })
      .join("\n\n");
  }

  private parseFunctionCall(
    content: string,
  ): { name: string; args: any } | null {
    try {
      // Find the first open brace
      const startIndex = content.indexOf("{");
      if (startIndex === -1) return null;

      // Extract JSON using brace counting
      let openBraces = 0;
      let endIndex = -1;
      let inString = false;
      let escape = false;

      for (let i = startIndex; i < content.length; i++) {
        const char = content[i];

        if (escape) {
          escape = false;
          continue;
        }

        if (char === "\\") {
          escape = true;
          continue;
        }

        if (char === '"') {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === "{") {
            openBraces++;
          } else if (char === "}") {
            openBraces--;
            if (openBraces === 0) {
              endIndex = i + 1;
              break;
            }
          }
        }
      }

      if (endIndex === -1) {
        // Fallback to original strategy if valid JSON block not found
        // logic below uses regex which is what we had before, but let's try just the substring if brace count failed (maybe incomplete)
        const jsonMatch = content.match(/\{[\s\S]*/);
        if (jsonMatch) {
          return this.attemptParse(jsonMatch[0]);
        }
        return null;
      }

      const jsonStr = content.substring(startIndex, endIndex);
      const result = this.attemptParse(jsonStr);

      // If exact extraction failed (e.g. malformed), try the loose regex approach as fallback
      if (!result) {
        const jsonMatch = content.match(/\{[\s\S]*/);
        if (jsonMatch) {
          return this.attemptParse(jsonMatch[0]);
        }
      }

      return result;
    } catch (e: any) {
      logger.debug(
        `Failed to parse function call from: ${content.substring(0, 200)}`,
      );
    }
    return null;
  }

  private attemptParse(jsonStr: string): { name: string; args: any } | null {
    const parsed = this.tryParseJson(jsonStr);

    if (!parsed) return null;

    logger.debug(`Parsed Ollama JSON:`, parsed);

    let result: { name: string; args: any } | null = null;

    // Format 1: {"function_call": {"name": "...", "arguments": {...}}}
    if (parsed.function_call && typeof parsed.function_call === "object") {
      result = {
        name: parsed.function_call.name,
        args: parsed.function_call.arguments || {},
      };
    }

    // Format 2: {"function_call": "functionName", "arguments": {...}} or {"name": "...", "arguments": {...}}
    else if (parsed.name || parsed.function_call) {
      result = {
        name: parsed.name || parsed.function_call,
        args: parsed.arguments || {},
      };
    }

    if (result) {
      // Post-process arguments to handle stringified JSON values
      // e.g. "queries": "[\"a\", \"b\"]" -> "queries": ["a", "b"]
      for (const key in result.args) {
        const value = result.args[key];
        if (typeof value === "string") {
          const trimmed = value.trim();
          if (
            (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
            (trimmed.startsWith("{") && trimmed.endsWith("}"))
          ) {
            try {
              result.args[key] = JSON.parse(value);
              logger.debug(
                `Parsed stringified argument for ${key}:`,
                result.args[key],
              );
            } catch (e) {
              // Ignore parsing error, keep as string
            }
          }
        }
      }
      return result;
    }
    return null;
  }

  private tryParseJson(str: string): any | null {
    try {
      return JSON.parse(str);
    } catch (e) {
      // Try appending closing braces (common truncation issue)
      const repairs = ["}", "}}", "}}}", '"}'];
      for (const repair of repairs) {
        try {
          return JSON.parse(str + repair);
        } catch (e2) {
          continue;
        }
      }
      return null;
    }
  }

  private async checkToolSupport(): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/show`, {
        name: this.model,
      });
      // This is a guess based on how new features are typically added.
      // We're checking if the model's details include a parameter related to tools.
      return (
        response.data.details?.families?.includes("llama3") ||
        response.data.details?.parameter_size?.startsWith("8B")
      );
    } catch (error: any) {
      logger.warn(
        `Failed to check tool support for ${this.model}. Assuming no support. Error: ${error.message}`,
      );
      return false;
    }
  }

  private formatToolsForOllama(tools: Tool[]): any[] {
    if (!tools || tools.length === 0) return [];

    const declarations = tools.flatMap(
      (t) => (t as any).functionDeclarations || [],
    );

    return declarations.map((fn: any) => ({
      type: "function",
      function: {
        name: fn.name,
        description: fn.description || "No description",
        parameters: fn.parameters || {},
      },
    }));
  }
}
