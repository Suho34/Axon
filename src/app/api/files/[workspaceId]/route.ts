import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Workspace from "@/Models/Workspace";
import { Types } from "mongoose";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> } // Change this line
) {
  try {
    // 1. Authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Access params WITH await (this is the key change)
    const { workspaceId } = await context.params; // Add await here

    // 3. Connect to the database
    await connectDB();

    // 4. Validate workspaceId
    if (!Types.ObjectId.isValid(workspaceId)) {
      return NextResponse.json(
        { error: "Invalid workspace ID format." },
        { status: 400 }
      );
    }

    // 5. Find workspace
    const workspace = await Workspace.findOne({
      _id: new Types.ObjectId(workspaceId),
      members: new Types.ObjectId(session.user.id),
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // 6. Return workspace
    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("Failed to fetch workspace:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace" },
      { status: 500 }
    );
  }
}
