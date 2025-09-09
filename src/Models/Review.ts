import mongoose, { Model, Schema, Types } from "mongoose";

export interface IReview {
  _id: Types.ObjectId;
  cardId: Types.ObjectId;
  userId: Types.ObjectId;
  // 0-5 rating (how well the user remembered)
  quality: number;
  // Track time spent
  reviewDuration: number; // in milliseconds
  // The state of the card BEFORE this review
  previousInterval: number;
  previousRepetition: number;
  previousEFactor: number;
  // The state of the card AFTER this review (calculated by SM-2)
  newInterval: number;
  newRepetition: number;
  newEFactor: number;
}

const ReviewSchema: Schema<IReview> = new Schema(
  {
    cardId: { type: Schema.Types.ObjectId, ref: "Card", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quality: { type: Number, min: 0, max: 5, required: true },
    reviewDuration: { type: Number, required: true },
    previousInterval: { type: Number, required: true },
    previousRepetition: { type: Number, required: true },
    previousEFactor: { type: Number, required: true },
    newInterval: { type: Number, required: true },
    newRepetition: { type: Number, required: true },
    newEFactor: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
export default Review;
