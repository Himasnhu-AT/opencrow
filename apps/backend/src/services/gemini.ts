import { GoogleGenerativeAI, FunctionDeclaration, Tool, Part } from '@google/generative-ai';
import { LLMService } from './llm.js';

export class GeminiService implements LLMService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: `You are an AI assistant embedded in a product. 
      You help users accomplish tasks by calling available API functions.
      Always be helpful, concise, and action-oriented.`
        });
    }

    async chat(
        message: string,
        tools: Tool[],
        history: any[] = []
    ) {
        const chat = this.model.startChat({
            history,
            tools,
        });

        let result = await chat.sendMessage(message);
        let response = result.response;

        // Handle function calls iteratively
        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            // Return function calls to be executed
            return {
                type: 'function_call' as const,
                functionCalls,
                chat
            };
        }

        return {
            type: 'text' as const,
            text: response.text(),
            chat
        };
    }

    async continueWithFunctionResult(
        chat: any,
        functionResults: any[]
    ) {
        // Construct the parts for the function response
        // The structure expected by Gemini for function responses involves 'functionResponse' part
        const result = await chat.sendMessage(functionResults);
        return {
            type: 'text' as const,
            text: result.response.text()
        };
    }
}
