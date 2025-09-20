import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Document from "@/Models/Document";
import { auth } from "@/lib/auth";
import { Types } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      // Use user ID for authentication check
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Connect to the database
    await connectDB();

    // 3. Get the workspaceId from the query parameters (if it exists)
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    // 4. Build the query filter based on the workspaceId and the authenticated user's ID
    const filter: {
      uploadedBy: Types.ObjectId | undefined;
      workspaceId?: Types.ObjectId;
    } = {
      // FIX: Use the user's ID and cast it to an ObjectId
      uploadedBy: new Types.ObjectId(session.user.id),
    };

    if (workspaceId) {
      if (!Types.ObjectId.isValid(workspaceId)) {
        return NextResponse.json(
          { error: "Invalid workspaceId format." },
          { status: 400 }
        );
      }
      filter.workspaceId = new Types.ObjectId(workspaceId);
    }

    // 5. Fetch documents using the constructed filter
    const documents = await Document.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "_id title uploadStatus pageCount createdAt processedAt errorMessage"
      );

    // 6. Return the documents
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
