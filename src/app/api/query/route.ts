import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chunk from "@/Models/Chunk";
import Document from "@/Models/Document";
import { JinaService } from "@/lib/ai/jina";
import { GeminiService } from "@/lib/ai/gemini";
import { auth } from "@/lib/auth";
import { Types } from "mongoose";

// Interface for the request body
interface QueryRequest {
  question: string;
  documentId: string;
  topK?: number;
}

// Interface for the final response
interface QueryResponse {
  answer: string;
  sources: {
    documentId: string;
    documentTitle: string;
    chunkId: string;
    text: string;
    pageNumber?: number;
    similarity: number;
  }[];
  totalChunksConsidered: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Interface to represent the chunk data after a .lean() query
interface LeanChunk {
  _id: Types.ObjectId;
  documentId: Types.ObjectId;
  text: string;
  embedding: number[];
  pageNumber?: number;
}

//Calculates the cosine similarity between two vectors.

function cosineSimilarity(a: number[], b: number[]): number {
  const minLength = Math.min(a.length, b.length);
  if (minLength === 0) return 0;

  const vectorA = a.slice(0, minLength);
  const vectorB = b.slice(0, minLength);

  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < minLength; i++) {
    dot += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

/**
 * Validates and converts an unknown-typed embedding to an array of numbers.
 * This function performs a robust check to ensure the embedding is a valid
 * array of numbers before it's used for similarity calculations.
 
 */
function validateEmbedding(embedding: unknown): number[] {
  if (!Array.isArray(embedding)) return [];
  return embedding
    .map((v) => (typeof v === "number" ? v : parseFloat(v)))
    .filter((n) => !isNaN(n));
}

/**
 * POST handler for the query endpoint.
 * This function takes a question and document ID, finds relevant chunks,
 * and uses an LLM to generate an answer based on the retrieved context.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const {
      question,
      documentId,
      topK = 5,
    }: QueryRequest = await request.json();
    if (!question || !documentId) {
      return NextResponse.json(
        { error: "Question and documentId are required" },
        { status: 400 }
      );
    }

    // Step 1: Create embedding for query
    const queryEmbedding = (await JinaService.generateEmbedding(question))
      .embedding;

    // Step 2: Get chunks only for this document
    const doc = await Document.findById(documentId).select("title");
    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const chunks = (await Chunk.find({
      documentId,
      embedding: { $exists: true, $ne: null, $not: { $size: 0 } },
    }).lean()) as LeanChunk[];

    if (!chunks.length) {
      return NextResponse.json({
        answer: "No chunks found. Please process this document first.",
        sources: [],
        totalChunksConsidered: 0,
      });
    }

    // Step 3: Compute similarities
    const scored = chunks
      .map((chunk) => {
        const emb = validateEmbedding(chunk.embedding);
        if (!emb.length) return null;
        return { chunk, sim: cosineSimilarity(queryEmbedding, emb) };
      })
      .filter(Boolean) as { chunk: LeanChunk; sim: number }[];

    // Step 4: Take top-K by similarity
    const top = scored
      .sort((a, b) => b.sim - a.sim)
      .slice(0, topK)
      .filter((c) => c.sim > 0.1);

    // Step 5: Generate answer
    let answer = "I couldn’t find enough relevant information.";
    let usage;
    if (top.length) {
      try {
        const res = await generateAnswerWithGemini(question, top, doc.title);
        answer = res.answer;
        usage = res.usage;
      } catch (e) {
        console.error("Gemini error:", e);
      }
    }

    const response: QueryResponse = {
      answer,
      sources: top.map(({ chunk, sim }) => ({
        documentId: documentId,
        documentTitle: doc.title,
        chunkId: chunk._id.toString(),
        text: chunk.text,
        pageNumber: chunk.pageNumber,
        similarity: parseFloat(sim.toFixed(4)),
      })),
      totalChunksConsidered: chunks.length,
      usage,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error("Query error:", err);
    return NextResponse.json(
      {
        error: "Query failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

// Generates an answer using the Gemini LLM with a given context.

async function generateAnswerWithGemini(
  question: string,
  top: { chunk: LeanChunk; sim: number }[],
  docTitle: string
) {
  const context = top
    .map(({ chunk }, i) => {
      const src = chunk.pageNumber
        ? `[From: ${docTitle}, Page ${chunk.pageNumber}]`
        : `[From: ${docTitle}]`;
      return `---SOURCE ${i + 1} ${src}---\n${chunk.text}\n`;
    })
    .join("\n");

  const prompt = `You are a helpful assistant answering based only on this PDF's content.\n
CONTEXT:\n${context}\n
QUESTION: ${question}\n
ANSWER:`;

  const res = await GeminiService.generateResponse(prompt);
  return { answer: res.text, usage: res.usage };
}
