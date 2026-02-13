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
    this.systemPrompt = `You are an AI assistant embedded in a product.
You help users accomplish tasks by calling available API functions.
Always be helpful, concise, and action-oriented.

When you need to call a function, respond with a JSON object in this exact format:
{"function_call": {"name": "function_name", "arguments": {...}}}

If you don't need to call a function, respond normally with text.`;

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
          },
        };
      }

      return {
        type: "text",
        text: content,
        chat: {
          history: [...messages, { role: "assistant", content }],
          getHistory: async () => [...messages, { role: "assistant", content }],
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
  ): Promise<LLMTextResult> {
    logger.debug(
      `Ollama continue with ${functionResults.length} function results`,
    );

    const newMessages = functionResults.map((r) => ({
      role: "tool",
      content: JSON.stringify(r.functionResponse.response),
      tool_call_id: r.toolCallId, // Assuming the tool call id is passed in functionResults
    }));

    const messages = [...chat.history, ...newMessages];

    try {
      const response = await axios.post(`${this.baseUrl}/api/chat`, {
        model: this.model,
        messages,
        stream: false,
      });

      const text = response.data.message.content;
      logger.debug(`Ollama follow-up response: ${text.substring(0, 200)}...`);

      return {
        type: "text",
        text,
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
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        logger.debug(`Parsed Ollama JSON:`, parsed);

        // Format 1: {"function_call": {"name": "...", "arguments": {...}}}
        if (parsed.function_call && typeof parsed.function_call === "object") {
          return {
            name: parsed.function_call.name,
            args: parsed.function_call.arguments || {},
          };
        }

        // Format 2: {"function_call": "functionName", "arguments": {...}} or {"name": "...", "arguments": {...}}
        if (parsed.name || parsed.function_call) {
          return {
            name: parsed.name || parsed.function_call,
            args: parsed.arguments || {},
          };
        }
      }
    } catch (e) {
      logger.debug(
        `Failed to parse function call from: ${content.substring(0, 200)}`,
      );
    }
    return null;
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
