import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chunk from "@/Models/Chunk";
import Document from "@/Models/Document";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Properly await params
    const { documentId } = await params;

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Security check: Verify user owns this document
    const document = await Document.findById(documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Get chunks for this document
    const chunks = await Chunk.find({ documentId })
      .sort({ chunkNumber: 1 })
      .select("chunkNumber text tokenCount startIndex endIndex");

    console.log(`Found ${chunks.length} chunks for document ${documentId}`);

    return NextResponse.json({
      success: true,
      chunkCount: chunks.length,
      chunks,
    });
  } catch (error) {
    console.error("Failed to fetch chunks:", error);
    return NextResponse.json(
      { error: "Failed to fetch chunks" },
      { status: 500 }
    );
  }
}
