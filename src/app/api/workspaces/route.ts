//src/app/api/workspaces/[workspaceId]/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Workspace from "@/Models/Workspace";
import User from "@/Models/User";
import { auth } from "@/lib/auth";
import mongoose, { ClientSession } from "mongoose";

// --- Type guard for Mongo errors ---
function isMongoError(err: unknown): err is { code: number; message: string } {
  return typeof err === "object" && err !== null && "code" in err;
}

// GET - Get user's workspaces
export async function GET() {
  try {
    await dbConnect();
    const authSession = await auth();

    if (!authSession?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: authSession.user.email }).populate(
      {
        path: "workspaceIds",
        select: "name  members createdAt ",
      }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Transform the workspaces to include user's role
    const workspaces = user.workspaceIds.map((workspace: any) => ({
      _id: workspace._id,
      name: workspace.name,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      role: user.roles?.get(workspace._id.toString()) || "member",
    }));

    return NextResponse.json({ workspaces }, { status: 200 });
  } catch (error: unknown) {
    console.error("Get workspaces error:", error);

    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a workspace
export async function DELETE(req: Request) {
  const session: ClientSession = await mongoose.startSession();

  try {
    await dbConnect();
    const authSession = await auth();

    if (!authSession?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("id");

    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return NextResponse.json(
        { error: "Valid workspace ID is required" },
        { status: 400 }
      );
    }

    session.startTransaction();

    const user = await User.findOne({ email: authSession.user.email }).session(
      session
    );

    if (!user) {
      await session.abortTransaction();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is admin of the workspace
    const userRole = user.roles?.get(workspaceId);
    if (userRole !== "admin") {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Only workspace admins can delete workspaces" },
        { status: 403 }
      );
    }

    // Find the workspace to ensure it exists
    const workspace = await Workspace.findById(workspaceId).session(session);
    if (!workspace) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Delete the workspace
    await Workspace.findByIdAndDelete(workspaceId).session(session);

    // Remove workspace from user's workspaceIds and roles
    user.workspaceIds = user.workspaceIds.filter(
      (id: mongoose.Types.ObjectId) => id.toString() !== workspaceId
    );

    if (user.roles) {
      user.roles.delete(workspaceId);
    }

    await user.save({ session });

    // Remove workspace from all other members
    await User.updateMany(
      {
        _id: { $in: workspace.members },
      },
      {
        $pull: { workspaceIds: workspaceId },
        $unset: { [`roles.${workspaceId}`]: 1 },
      },
      { session }
    );

    await session.commitTransaction();

    return NextResponse.json(
      { message: "Workspace deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    await session.abortTransaction();

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Workspace deletion error:", error);

    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}

// POST - Create workspace (existing code)
export async function POST(req: Request) {
  const session: ClientSession = await mongoose.startSession();

  try {
    await dbConnect();
    const authSession = await auth();

    if (!authSession?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name }: { name?: string } = await req.json();

    // ✅ Strong input validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Valid workspace name is required" },
        { status: 400 }
      );
    }

    session.startTransaction();

    const user = await User.findOne({ email: authSession.user.email }).session(
      session
    );

    if (!user) {
      await session.abortTransaction();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Create workspace in transaction
    const [newWorkspace] = await Workspace.create(
      [
        {
          name: name.trim(),
          createdBy: user._id,
          members: [user._id],
        },
      ],
      { session }
    );

    if (!newWorkspace) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Failed to create workspace" },
        { status: 500 }
      );
    }

    // ✅ Update user roles + workspaces
    user.workspaceIds.push(newWorkspace._id);

    if (!user.roles) {
      user.roles = new Map<string, "admin" | "member">();
    }
    user.roles.set(newWorkspace._id.toString(), "admin");

    await user.save({ session });

    // ✅ Commit transaction
    await session.commitTransaction();

    return NextResponse.json({ workspace: newWorkspace }, { status: 201 });
  } catch (error: unknown) {
    await session.abortTransaction();

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (isMongoError(error) && error.code === 11000) {
      return NextResponse.json(
        { error: "Workspace name already exists" },
        { status: 409 }
      );
    }

    console.error("Workspace creation error:", error);

    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
