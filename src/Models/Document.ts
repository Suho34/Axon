import mongoose, {
  Document as MongoDocument,
  Types,
  Schema,
  Model,
} from "mongoose";

export interface IDocument extends MongoDocument {
  title: string;
  originalName: string;
  storageUrl: string;
  uploadStatus:
    | "uploading"
    | "processing"
    | "processed"
    | "completed"
    | "failed";
  embeddingStatus?:
    | "pending"
    | "processing"
    | "completed"
    | "partial"
    | "failed";
  embeddedAt?: Date;
  workspaceId: Types.ObjectId;
  uploadedBy: Types.ObjectId; // User ID
  mimeType?: string;
  size?: number;
  // For tracking processing
  errorMessage?: string;
  pageCount?: number;
  processedAt?: Date;
  _id: Types.ObjectId;
}

const DocumentSchema: Schema<IDocument> = new Schema(
  {
    title: { type: String, required: true },
    originalName: { type: String, required: true },
    storageUrl: { type: String, required: true },
    uploadStatus: {
      type: String,
      enum: ["uploading", "processing", "completed", "failed"],
      default: "uploading",
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mimeType: { type: String },
    size: { type: Number },
    errorMessage: { type: String },
    pageCount: { type: Number },
    processedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Document: Model<IDocument> =
  mongoose.models.Document ||
  mongoose.model<IDocument>("Document", DocumentSchema);
export default Document;
