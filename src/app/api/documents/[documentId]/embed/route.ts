// app/api/process/[documentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Document from "@/Models/Document";
import Chunk from "@/Models/Chunk";
import { TextExtractor } from "@/lib/pdf/textExtractor";
import { ChunkingService } from "@/lib/pdf/chunking";
import { JinaService } from "@/lib/ai/jina";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";

// Configuration for embedding
const BATCH_SIZE = 50;
const DELAY_BETWEEN_BATCHES = 100;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const document = await Document.findById(documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (document.uploadStatus !== "uploading") {
      return NextResponse.json(
        {
          error: `Document status is "${document.uploadStatus}", cannot process`,
        },
        { status: 400 }
      );
    }

    // Mark as processing
    await Document.findByIdAndUpdate(documentId, {
      uploadStatus: "processing",
    });

    // STEP 1: Fetch PDF from storage and extract text
    const response = await fetch(document.storageUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extractionResult = await TextExtractor.extractTextFromBuffer(buffer);

    if (!extractionResult.fullText || extractionResult.fullText.length === 0) {
      throw new Error("No text extracted from PDF");
    }

    // STEP 2: Create chunks
    const chunks = ChunkingService.chunkText(extractionResult.fullText);
    if (chunks.length === 0) throw new Error("No chunks created");

    // Save chunks in batches
    const batchSize = 20;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      await Promise.all(
        batch.map((chunk) =>
          Chunk.create({
            documentId: document._id,
            text: chunk.text,
            chunkNumber: chunk.chunkNumber,
            startIndex: chunk.startIndex,
            endIndex: chunk.endIndex,
            tokenCount: chunk.tokenCount,
            // Only add embeddingHash if it's not null/undefined
            ...(chunk.text ? { embeddingHash: randomUUID() } : {}),
          })
        )
      );
    }

    // Mark document as processed
    await Document.findByIdAndUpdate(documentId, {
      uploadStatus: "processed",
      pageCount: extractionResult.pageCount,
      processedAt: new Date(),
    });

    console.log(`✅ Text extraction completed for document ${documentId}`);
    console.log(`📊 Created ${chunks.length} chunks`);

    // STEP 3: Generate embeddings for all chunks
    console.log(`🚀 Starting embedding process for document ${documentId}`);

    // Fetch all chunks for this document
    const allChunks = await Chunk.find({ documentId });

    let processedCount = 0;
    let failedCount = 0;

    // Process chunks in batches using Jina's batch API
    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
      const batch = allChunks.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(allChunks.length / BATCH_SIZE);

      console.log(
        `🔄 Processing embedding batch ${batchNumber} of ${totalBatches}`
      );

      try {
        // Extract texts from the batch
        const texts = batch.map((chunk) => chunk.text);

        // Get embeddings for the entire batch
        const embeddings = await JinaService.generateBatchEmbeddings(texts);

        // Update each chunk with its embedding
        const updatePromises = batch.map((chunk, index) => {
          chunk.embedding = embeddings[index].embedding;
          chunk.embeddingModel = embeddings[index].model;
          chunk.embeddedAt = new Date();
          return chunk.save();
        });

        await Promise.all(updatePromises);

        processedCount += batch.length;
        console.log(
          `✅ Processed embedding batch ${batchNumber} with ${batch.length} chunks`
        );
      } catch (error) {
        console.error(
          `❌ Error processing embedding batch ${batchNumber}:`,
          error
        );
        failedCount += batch.length;
        // Continue with next batch instead of failing completely
      }

      // Add small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < allChunks.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_BATCHES)
        );
      }
    }

    // Final update - mark document as completed with embeddings
    await Document.findByIdAndUpdate(documentId, {
      uploadStatus: "completed",
      embeddedAt: new Date(),
      embeddingStatus: failedCount > 0 ? "partial" : "completed",
    });

    console.log(`✅ Embedding completed for document ${documentId}`);
    console.log(
      `📊 Summary: ${processedCount} chunks processed, ${failedCount} failed`
    );

    return NextResponse.json({
      success: true,
      message: "Document processing and embedding completed successfully",
      documentId,
      chunks: chunks.length,
      processedCount,
      failedCount,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Processing error:", errorMessage);

    // Mark document as failed
    await Document.findByIdAndUpdate(documentId, {
      uploadStatus: "failed",
      errorMessage,
      processedAt: new Date(),
    });

    return NextResponse.json(
      { error: "Failed to process document", details: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to check processing status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    await connectDB();
    const { documentId } = await params;

    const document = await Document.findById(documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Get chunk statistics
    const totalChunks = await Chunk.countDocuments({ documentId });
    const embeddedChunks = await Chunk.countDocuments({
      documentId,
      embedding: { $exists: true, $ne: null, $not: { $size: 0 } },
    });

    return NextResponse.json({
      documentId,
      uploadStatus: document.uploadStatus,
      pageCount: document.pageCount,
      processedAt: document.processedAt,
      embeddedAt: document.embeddedAt,
      chunkStats: {
        total: totalChunks,
        embedded: embeddedChunks,
        remaining: totalChunks - embeddedChunks,
      },
    });
  } catch (error) {
    console.error("Error fetching processing status:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch processing status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
