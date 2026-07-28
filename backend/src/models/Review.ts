import { HydratedDocument, model, models, Schema } from 'mongoose';
import { ObjectId } from './shared';

export interface IReview {
  product: ObjectId;
  user?: ObjectId;
  author: string;
  rating: number;
  comment: string;
  verified: boolean;
  userPhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewDocument = HydratedDocument<IReview>;

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    author: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    verified: { type: Boolean, default: false },
    userPhoto: { type: String, trim: true },
  },
  { timestamps: true },
);

reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ user: 1, createdAt: -1 }, { sparse: true });

export const Review = models.Review || model<IReview>('Review', reviewSchema);
