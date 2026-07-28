import { HydratedDocument, model, models, Schema } from 'mongoose';

export interface IDesignTheme {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder: number;
}

export type DesignThemeDocument = HydratedDocument<IDesignTheme>;

const designThemeSchema = new Schema<IDesignTheme>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    icon: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: false },
);

designThemeSchema.index({ displayOrder: 1 });

export const DesignTheme = models.DesignTheme || model<IDesignTheme>('DesignTheme', designThemeSchema);
