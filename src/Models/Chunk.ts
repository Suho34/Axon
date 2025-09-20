import mongoose, { Schema, Model, Types } from "mongoose";

export interface IChunk {
  _id: Types.ObjectId;
  documentId: Types.ObjectId;
  text: string;
  chunkNumber: number;
  // For traceability - which page and offset did this come from?
  pageNumber?: number;
  startIndex?: number;
  endIndex?: number;
  // THE VECTOR: This is what gets searched
  embedding: number[];
  // For caching and deduplication
  embeddingHash?: string;
  // Metadata for retrieval quality
  tokenCount: number;
  embeddingModel?: string;
  tokenUsage?: number;
  embeddedAt?: Date;
}

const ChunkSchema: Schema<IChunk> = new Schema(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    text: { type: String, required: true },
    chunkNumber: { type: Number, required: true },
    pageNumber: { type: Number },
    startIndex: { type: Number },
    endIndex: { type: Number },
    embedding: { type: [Number], index: true }, // <- Index for vector search!
    embeddingHash: { type: String, sparse: true, unique: false }, // Hash of 'text' to avoid duplicate embeddings
    tokenCount: { type: Number, required: true },
    embeddingModel: { type: String },
    tokenUsage: { type: Number },
    embeddedAt: { type: Date },
  },
  { timestamps: true }
);

// Create index for vector search later (MongoDB Atlas Vector Search will use this)
ChunkSchema.index({ documentId: 1, chunkNumber: 1 });

const Chunk: Model<IChunk> =
  mongoose.models.Chunk || mongoose.model<IChunk>("Chunk", ChunkSchema);
export default Chunk;
