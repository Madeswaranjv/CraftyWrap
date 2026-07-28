import { HydratedDocument, model, models, Schema } from 'mongoose';

export interface IProductType {
  name: string;
  slug: string;
  icon?: string;
  displayOrder: number;
}

export type ProductTypeDocument = HydratedDocument<IProductType>;

const productTypeSchema = new Schema<IProductType>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: false },
);

productTypeSchema.index({ displayOrder: 1 });

export const ProductType = models.ProductType || model<IProductType>('ProductType', productTypeSchema);
