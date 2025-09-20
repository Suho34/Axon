import mongoose, { Schema, Model, Types } from "mongoose";

// 1. Define the TypeScript Interface
export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name?: string;
  image?: string;
  workspaceIds: Types.ObjectId[];
  roles: Map<string, "admin" | "member">;
}

// 2. Define the Mongoose Schema
const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String },
    image: { type: String },
    workspaceIds: [{ type: Schema.Types.ObjectId, ref: "Workspace" }],
    roles: {
      type: Map,
      of: { type: String, enum: ["admin", "member"] },
      default: new Map(),
    },
  },
  { timestamps: true }
);

// 3. Create a Model
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
