// lib/ai/jina.ts
import "dotenv/config";

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
}

// Interface for the Jina API response
interface JinaApiResponse {
  data: Array<{
    embedding: number[];
    index: number;
    object: string;
  }>;
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class JinaService {
  private static API_URL = "https://api.jina.ai/v1/embeddings";
  private static API_KEY = process.env.JINA_API_KEY;

  static async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    if (!this.API_KEY) {
      throw new Error("JINA_API_KEY is missing in environment variables");
    }

    const response = await fetch(this.API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "jina-embeddings-v2-base-en",
        input: text,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Jina API error: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    const result: JinaApiResponse = await response.json();

    return {
      embedding: result.data[0].embedding,
      model: result.model,
    };
  }

  static async generateBatchEmbeddings(
    texts: string[]
  ): Promise<EmbeddingResponse[]> {
    if (!this.API_KEY) {
      throw new Error("JINA_API_KEY is missing in environment variables");
    }

    if (texts.length > 128) {
      throw new Error("Jina API supports a maximum of 128 inputs per request");
    }

    const response = await fetch(this.API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "jina-embeddings-v2-base-en",
        input: texts,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Jina API error: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    const result: JinaApiResponse = await response.json();

    return result.data.map((item) => ({
      embedding: item.embedding,
      model: result.model,
    }));
  }
}
