import mongoose, { Schema, Model, Types } from "mongoose";

export interface IWorkspace {
  _id: Types.ObjectId;
  name: string;
  createdBy: Types.ObjectId;
  members: Types.ObjectId[];
}

const WorkspaceSchema: Schema<IWorkspace> = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Workspace: Model<IWorkspace> =
  mongoose.models.Workspace ||
  mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);
export default Workspace;
