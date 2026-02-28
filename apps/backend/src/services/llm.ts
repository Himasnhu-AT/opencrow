import { Tool } from "@google/generative-ai";
import { Logger } from "../utils/logger.js";
import { GeminiService } from "./gemini.js";
import { OllamaService } from "./ollama.js";
import { OpenAIService } from "./openai.js";

const logger = new Logger();

/**
 * Common interface for LLM services (Gemini, Ollama, OpenAI-compatible, etc.)
 */
export interface LLMService {
  chat(message: string, tools: Tool[], history: any[]): Promise<LLMChatResult>;
  continueWithFunctionResult(
    chat: any,
    functionResults: any[],
  ): Promise<LLMChatResult>;
  getEmbedding(text: string): Promise<number[]>;
}

export interface LLMChatResult {
  type: "function_call" | "text";
  functionCalls?: Array<{ name: string; args: any; toolCallId?: string }>;
  text?: string;
  chat: any;
}

export interface LLMTextResult {
  type: "text";
  text: string;
}

/**
 * Factory function to get the appropriate LLM service based on env config
 */
export function getLLMService(): LLMService {
  const provider = process.env.LLM_PROVIDER || "gemini";

  logger.info(`Using LLM provider: ${provider}`);

  switch (provider.toLowerCase()) {
    case "ollama":
      return new OllamaService(
        process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        process.env.OLLAMA_MODEL || "llama3.2:1b",
      );
    case "openai":
      return new OpenAIService(
        process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
        process.env.OPENAI_API_KEY || "",
        process.env.OPENAI_MODEL || "gpt-4o-mini",
      );
    case "gemini":
    default:
      return new GeminiService(process.env.GEMINI_API_KEY!);
  }
}
