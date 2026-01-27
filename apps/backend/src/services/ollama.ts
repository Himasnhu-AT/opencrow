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

    // Build messages array from history
    const messages = this.buildMessages(history, message, tools);

    try {
      const response = await axios.post(`${this.baseUrl}/api/chat`, {
        model: this.model,
        messages,
        stream: false,
        options: {
          temperature: 0.7,
        },
      });

      const content = response.data.message.content;
      logger.debug(`Ollama response: ${content.substring(0, 200)}...`);

      // Try to parse function call from response
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

    // Add function results to history
    const functionResultsText = functionResults
      .map(
        (r) =>
          `Function ${r.functionResponse.name} returned: ${JSON.stringify(r.functionResponse.response)}`,
      )
      .join("\n");

    const messages = [
      ...chat.history,
      {
        role: "user",
        content: `Function results:\n${functionResultsText}\n\nPlease provide a helpful response based on these results.`,
      },
    ];

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
      logger.error(`Ollama continue error: ${error.message}`);
      throw new Error(`Ollama API error: ${error.message}`);
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
}
