import OpenAI from "openai";
import { Tool } from "@google/generative-ai";
import { LLMService, LLMChatResult } from "./llm.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger();

/**
 * OpenAI-compatible service for providers like Modal.com, Together AI, etc.
 * Uses the OpenAI SDK with a custom base URL to connect to any OpenAI-compatible endpoint.
 */
export class OpenAIService implements LLMService {
  private client: OpenAI;
  private model: string;
  private systemPrompt: string;

  constructor(baseURL: string, apiKey: string, model: string) {
    this.client = new OpenAI({
      baseURL,
      apiKey,
    });
    this.model = model;
    this.systemPrompt = `You are an AI assistant embedded in a product.
You help users accomplish tasks by calling available API functions.
Always be helpful, concise, and action-oriented.`;

    logger.info(`OpenAIService initialized with model: ${model} at ${baseURL}`);
  }

  async chat(
    message: string,
    tools: Tool[],
    history: any[] = [],
  ): Promise<LLMChatResult> {
    logger.debug(`OpenAI chat request: ${message.substring(0, 100)}...`);

    const messages = this.buildMessages(history, message);
    const openaiTools = this.convertToolsToOpenAI(tools);

    try {
      const requestParams: OpenAI.ChatCompletionCreateParams = {
        model: this.model,
        messages,
        temperature: 0.7,
      };

      if (openaiTools.length > 0) {
        requestParams.tools = openaiTools;
        requestParams.tool_choice = "auto";
      }

      const response = await this.client.chat.completions.create(requestParams);
      const choice = response.choices[0];

      if (!choice) {
        throw new Error("No response choice returned from OpenAI API");
      }

      const assistantMessage = choice.message;

      // Check for tool calls (filter to function-type only)
      const toolCalls = (assistantMessage.tool_calls || []).filter(
        (
          tc,
        ): tc is OpenAI.ChatCompletionMessageToolCall & { type: "function" } =>
          tc.type === "function",
      );

      if (toolCalls.length > 0) {
        logger.info(
          `OpenAI tool calls detected: ${toolCalls.map((tc) => tc.function.name).join(", ")}`,
        );

        return {
          type: "function_call",
          functionCalls: toolCalls.map((tc) => ({
            name: tc.function.name,
            args: JSON.parse(tc.function.arguments),
            toolCallId: tc.id,
          })),
          chat: {
            history: [...messages, assistantMessage],
            getHistory: async () => [...messages, assistantMessage],
            tools: openaiTools,
          },
        };
      }

      const text = assistantMessage.content || "";
      return {
        type: "text",
        text,
        chat: {
          history: [...messages, assistantMessage],
          getHistory: async () => [...messages, assistantMessage],
          tools: openaiTools,
        },
      };
    } catch (error: any) {
      logger.error(`OpenAI chat error: ${error.message}`);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  async continueWithFunctionResult(
    chat: any,
    functionResults: any[],
  ): Promise<LLMChatResult> {
    logger.debug(
      `OpenAI continue with ${functionResults.length} function results`,
    );

    // Build tool result messages in OpenAI format
    const toolMessages: OpenAI.ChatCompletionToolMessageParam[] =
      functionResults.map((r) => ({
        role: "tool" as const,
        tool_call_id: r.toolCallId || r.functionResponse?.name || "unknown",
        content: JSON.stringify(r.functionResponse?.response ?? r),
      }));

    const messages = [...chat.history, ...toolMessages];

    try {
      const requestParams: OpenAI.ChatCompletionCreateParams = {
        model: this.model,
        messages,
        temperature: 0.7,
      };

      if (chat.tools && chat.tools.length > 0) {
        requestParams.tools = chat.tools;
        requestParams.tool_choice = "auto";
      }

      const response = await this.client.chat.completions.create(requestParams);
      const choice = response.choices[0];

      if (!choice) {
        throw new Error("No response choice returned from OpenAI API");
      }

      const assistantMessage = choice.message;

      const followUpToolCalls = (assistantMessage.tool_calls || []).filter(
        (
          tc,
        ): tc is OpenAI.ChatCompletionMessageToolCall & { type: "function" } =>
          tc.type === "function",
      );

      if (followUpToolCalls.length > 0) {
        logger.info(
          `OpenAI follow-up tool calls: ${followUpToolCalls.map((tc) => tc.function.name).join(", ")}`,
        );

        return {
          type: "function_call",
          functionCalls: followUpToolCalls.map((tc) => ({
            name: tc.function.name,
            args: JSON.parse(tc.function.arguments),
            toolCallId: tc.id,
          })),
          chat: {
            history: [...messages, assistantMessage],
            getHistory: async () => [...messages, assistantMessage],
            tools: chat.tools,
          },
        };
      }

      const text = assistantMessage.content || "";
      return {
        type: "text",
        text,
        chat: {
          history: [...messages, assistantMessage],
          getHistory: async () => [...messages, assistantMessage],
          tools: chat.tools,
        },
      };
    } catch (error: any) {
      logger.error(`OpenAI continue error: ${error.message}`);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.model,
        input: text,
      });
      return response.data[0].embedding;
    } catch (error: any) {
      logger.warn(
        `OpenAI embedding failed (model may not support embeddings): ${error.message}. Returning empty embedding.`,
      );
      // Many Modal deployments won't support embeddings — return zeros as fallback
      return new Array(384).fill(0);
    }
  }

  /**
   * Convert Gemini-format tool declarations to OpenAI tool format
   */
  private convertToolsToOpenAI(tools: Tool[]): OpenAI.ChatCompletionTool[] {
    if (!tools || tools.length === 0) return [];

    const declarations = tools.flatMap(
      (t) => (t as any).functionDeclarations || [],
    );

    return declarations.map((fn: any) => ({
      type: "function" as const,
      function: {
        name: fn.name,
        description: fn.description || "No description",
        parameters: fn.parameters || { type: "object", properties: {} },
      },
    }));
  }

  /**
   * Build OpenAI-format messages from history + new user message
   */
  private buildMessages(
    history: any[],
    message: string,
  ): OpenAI.ChatCompletionMessageParam[] {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: this.systemPrompt },
    ];

    // Convert history (could be Gemini format or OpenAI format)
    for (const item of history) {
      if (item.role && item.content !== undefined) {
        // Already in OpenAI-ish format
        const role =
          item.role === "model"
            ? "assistant"
            : item.role === "function"
              ? "assistant"
              : item.role;
        messages.push({ role, content: item.content } as any);
      } else if (item.role && item.parts) {
        // Gemini format
        const content = item.parts
          .map((p: any) => p.text || JSON.stringify(p))
          .join(" ");
        messages.push({
          role: item.role === "model" ? "assistant" : item.role,
          content,
        } as any);
      }
    }

    messages.push({ role: "user", content: message });
    return messages;
  }
}
