// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Document from "@/Models/Document";
import Workspace from "@/Models/Workspace";
import User from "@/Models/User";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ["application/pdf"];

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return errorResponse("UNAUTHORIZED", "You must be signed in", 401);
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return errorResponse("USER_NOT_FOUND", "User not found", 404);
    }

    const url = new URL(req.url);
    const workspaceId = url.searchParams.get("workspaceId");
    if (!workspaceId) {
      return errorResponse(
        "MISSING_WORKSPACE_ID",
        "workspaceId is required",
        400
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return errorResponse("MISSING_FILE", "No file uploaded", 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return errorResponse("INVALID_TYPE", "Only PDF files are allowed", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(
        "FILE_TOO_LARGE",
        "File must be less than 10MB",
        400
      );
    }

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      members: user._id,
    });
    if (!workspace) {
      return errorResponse(
        "FORBIDDEN",
        "You don't have access to this workspace",
        403
      );
    }

    // Upload to Vercel Blob
    const safeName = file.name.replace(/[^\w.-]+/g, "_");
    const blob = await put(`${randomUUID()}-${safeName}`, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // Save document metadata (but not completed yet!)
    const doc = await Document.create({
      title: safeName.replace(/\.[^/.]+$/, ""),
      originalName: file.name,
      storageUrl: blob.url,
      uploadStatus: "uploading", // 👈 was "completed"
      workspaceId,
      uploadedBy: user._id,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date(),
    });

    return NextResponse.json({ success: true, document: doc }, { status: 201 });
  } catch (err: unknown) {
    console.error("Upload API error:", err);
    return errorResponse(
      "UPLOAD_FAILED",
      "Internal server error during upload",
      500
    );
  }
}
