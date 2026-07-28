import { HydratedDocument, model, models, Schema } from 'mongoose';

export type DiscountType = 'percentage' | 'fixed_amount';

export interface IPromoCode {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minSubtotal?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiryDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PromoCodeDocument = HydratedDocument<IPromoCode>;

const promoCodeSchema = new Schema<IPromoCode>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, required: true, enum: ['percentage', 'fixed_amount'] },
    discountValue: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, min: 0, default: 0 },
    maxDiscount: { type: Number, min: 0 },
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

promoCodeSchema.index({ isActive: 1, expiryDate: 1 });

export const PromoCode = models.PromoCode || model<IPromoCode>('PromoCode', promoCodeSchema);
