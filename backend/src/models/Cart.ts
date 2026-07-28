import { HydratedDocument, model, models, Schema } from 'mongoose';
import { ObjectId } from './shared';

export interface ICartItem {
  product: ObjectId;
  quantity: number;
  customNote?: string;
}

export interface ICart {
  user?: ObjectId;
  cartToken?: string;
  items: ICartItem[];
  giftWrap: boolean;
  giftNote?: string;
  promoCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CartDocument = HydratedDocument<ICart>;

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    customNote: { type: String, trim: true },
  },
  { _id: false },
);

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
    cartToken: { type: String, trim: true, sparse: true },
    items: { type: [cartItemSchema], default: [] },
    giftWrap: { type: Boolean, default: false },
    giftNote: { type: String, trim: true },
    promoCode: { type: String, uppercase: true, trim: true },
  },
  { timestamps: true },
);

cartSchema.index({ user: 1 }, { unique: true, sparse: true });
cartSchema.index({ cartToken: 1 }, { unique: true, sparse: true });

export const Cart = models.Cart || model<ICart>('Cart', cartSchema);
