import {
  GoogleGenerativeAI,
  GoogleGenerativeAIError,
  GenerativeModel,
} from "@google/generative-ai";

export interface GeminiResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class GeminiService {
  private static genAI: GoogleGenerativeAI;
  // Correcting the type from 'any' to 'GenerativeModel' for type safety.
  private static model: GenerativeModel;

  static initialize() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is missing in environment variables");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // Using the free tier model
      generationConfig: {
        temperature: 0.1, // Lower temperature for more factual responses
        topP: 0.8,
        topK: 40,
      },
    });
  }

  static async generateResponse(prompt: string): Promise<GeminiResponse> {
    if (!this.genAI) {
      this.initialize();
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract usage data if available
      const usage = result.response.usageMetadata
        ? {
            promptTokens: result.response.usageMetadata.promptTokenCount,
            completionTokens:
              result.response.usageMetadata.candidatesTokenCount,
            totalTokens: result.response.usageMetadata.totalTokenCount,
          }
        : undefined;

      return { text, usage };
    } catch (error) {
      if (error instanceof GoogleGenerativeAIError) {
        console.error("Gemini API error:", error);
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw error;
    }
  }
}
