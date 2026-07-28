import { HydratedDocument, model, models, Schema } from 'mongoose';
import { addressSchema, IAddress, ObjectId } from './shared';

export type UserRole = 'customer' | 'admin';

export interface IUser {
  googleId?: string;
  name: string;
  email: string;
  passwordHash?: string;
  avatarUrl?: string;
  role: UserRole;
  phone?: string;
  addresses: IAddress[];
  wishlist: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    googleId: { type: String, trim: true, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    avatarUrl: { type: String, trim: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    phone: { type: String, trim: true },
    addresses: { type: [addressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true },
);

export const User = models.User || model<IUser>('User', userSchema);
