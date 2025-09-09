import mongoose, { Schema, Types } from "mongoose";

export interface ICard {
  // CRITICAL: Link back to the source for provenance
  chunkId: Types.ObjectId;
  documentId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  // The actual content
  question: string;
  answer: string;
  // For Spaced Repetition System (SRS)
  nextReviewAt: Date;
  interval: number; // Days until next review
  repetition: number; // How many times successfully recalled
  efactor: number; // Easiness factor
  // For organization
  tags?: string[];
  _id: Types.ObjectId;
}

const CardSchema: Schema<ICard> = new Schema(
  {
    chunkId: { type: Schema.Types.ObjectId, ref: "Chunk", required: true },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    nextReviewAt: { type: Date, default: Date.now },
    interval: { type: Number, default: 1 },
    repetition: { type: Number, default: 0 },
    efactor: { type: Number, default: 2.5 }, // Standard initial value for SM-2
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const Card: mongoose.Model<ICard> =
  mongoose.models.Card || mongoose.model<ICard>("Card", CardSchema);
export default Card;
