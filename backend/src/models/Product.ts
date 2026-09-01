import { HydratedDocument, model, models, Schema } from 'mongoose';

export interface IProduct {
  slug: string;
  name: string;
  productType: string;
  designTheme: string;
  yarnType: string;
  size: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  stockCount: number;
  prepTimeDays: number;
  isBestSeller: boolean;
  isNew: boolean;
  description: string;
  highlights: string[];
  careInstructions?: string;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductDocument = HydratedDocument<IProduct>;

const productSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    productType: { type: String, required: true, trim: true },
    designTheme: { type: String, required: true, trim: true },
    yarnType: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    stockCount: { type: Number, default: 0, min: 0 },
    prepTimeDays: { type: Number, required: true, min: 0 },
    isBestSeller: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    description: { type: String, required: true, trim: true },
    highlights: { type: [String], default: [] },
    careInstructions: { type: String, trim: true },
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, suppressReservedKeysWarning: true },
);

productSchema.index({ isActive: 1, productType: 1, designTheme: 1, yarnType: 1, size: 1 });
productSchema.index({ isActive: 1, isBestSeller: 1, createdAt: -1 });
productSchema.index({ isActive: 1, isNew: 1, createdAt: -1 });
productSchema.index({ isActive: 1, price: 1 });
productSchema.index({ isActive: 1, price: 1, createdAt: -1 });
productSchema.index({ isActive: 1, rating: -1, reviewCount: -1, createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' });

export const Product = models.Product || model<IProduct>('Product', productSchema);
