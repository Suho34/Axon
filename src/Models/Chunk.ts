import mongoose, { Schema, Model, Types } from "mongoose";

export interface IChunk {
  _id: Types.ObjectId;
  documentId: Types.ObjectId;
  text: string;
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
}

const ChunkSchema: Schema<IChunk> = new Schema(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    text: { type: String, required: true },
    pageNumber: { type: Number },
    startIndex: { type: Number },
    endIndex: { type: Number },
    embedding: { type: [Number], required: true, index: true }, // <- Index for vector search!
    embeddingHash: { type: String, unique: true }, // Hash of 'text' to avoid duplicate embeddings
    tokenCount: { type: Number, required: true },
  },
  { timestamps: true }
);

// Create index for vector search later (MongoDB Atlas Vector Search will use this)
ChunkSchema.index({ embedding: "2dsphere" });

const Chunk: Model<IChunk> =
  mongoose.models.Chunk || mongoose.model<IChunk>("Chunk", ChunkSchema);
export default Chunk;
