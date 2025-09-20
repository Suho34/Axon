// api/document/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Document from "@/Models/Document";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get documents for the authenticated user
    const documents = await Document.find()
      .sort({ createdAt: -1 })
      .select(
        "_id title uploadStatus pageCount createdAt processedAt errorMessage"
      );

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
