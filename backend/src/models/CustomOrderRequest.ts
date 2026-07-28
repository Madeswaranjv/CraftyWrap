import { HydratedDocument, model, models, Schema } from 'mongoose';
import { ObjectId } from './shared';

export interface ICustomOrderRequest {
  user?: ObjectId;
  name: string;
  email: string;
  phone: string;
  yarnPreference?: string;
  budgetRange?: string;
  description: string;
  referenceImageUrl?: string;
  referenceDollSlug?: string;
  status: string;
  artisanNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CustomOrderRequestDocument = HydratedDocument<ICustomOrderRequest>;

const customOrderRequestSchema = new Schema<ICustomOrderRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    yarnPreference: { type: String, trim: true },
    budgetRange: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    referenceImageUrl: { type: String, trim: true },
    referenceDollSlug: { type: String, trim: true },
    status: { type: String, default: 'pending', trim: true },
    artisanNotes: { type: String, trim: true },
  },
  { timestamps: true },
);

customOrderRequestSchema.index({ user: 1, createdAt: -1 });
customOrderRequestSchema.index({ status: 1, createdAt: -1 });
customOrderRequestSchema.index({ email: 1, createdAt: -1 });

export const CustomOrderRequest =
  models.CustomOrderRequest || model<ICustomOrderRequest>('CustomOrderRequest', customOrderRequestSchema);
