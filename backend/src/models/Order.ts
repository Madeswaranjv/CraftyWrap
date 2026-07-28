import { HydratedDocument, model, models, Schema } from 'mongoose';
import { addressSchema, IAddress, ObjectId } from './shared';

export type PaymentMethod = 'razorpay' | 'upi_manual';
export type PaymentStatus = 'paid' | 'pending_verification' | 'failed' | 'refunded';
export type OrderStatus = 'payment_pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface IOrderItem {
  product: ObjectId;
  name: string;
  productType: string;
  designTheme: string;
  yarnType: string;
  size: string;
  price: number;
  quantity: number;
  customNote?: string;
}

export interface IPaymentDetails {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  upiTransactionId?: string;
  payerVpa?: string;
  paidAt?: Date;
  failureReason?: string;
  refundId?: string;
}

export interface IOrder {
  orderNumber: string;
  user?: ObjectId;
  guestEmail?: string;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  giftWrapFee: number;
  discountAmount: number;
  promoCodeApplied?: string;
  total: number;
  giftWrap: boolean;
  giftNote?: string;
  shippingAddress: IAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: IPaymentDetails;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = HydratedDocument<IOrder>;

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true, trim: true },
    productType: { type: String, required: true, trim: true },
    designTheme: { type: String, required: true, trim: true },
    yarnType: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    customNote: { type: String, trim: true },
  },
  { _id: false },
);

const paymentDetailsSchema = new Schema<IPaymentDetails>(
  {
    razorpayOrderId: { type: String, trim: true },
    razorpayPaymentId: { type: String, trim: true },
    razorpaySignature: { type: String, trim: true },
    upiTransactionId: { type: String, trim: true },
    payerVpa: { type: String, trim: true },
    paidAt: { type: Date },
    failureReason: { type: String, trim: true },
    refundId: { type: String, trim: true },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    guestEmail: { type: String, lowercase: true, trim: true },
    items: { type: [orderItemSchema], required: true, validate: [(items: IOrderItem[]) => items.length > 0, 'An order must contain at least one item.'] },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0 },
    giftWrapFee: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, required: true, min: 0 },
    promoCodeApplied: { type: String, uppercase: true, trim: true },
    total: { type: Number, required: true, min: 0 },
    giftWrap: { type: Boolean, default: false },
    giftNote: { type: String, trim: true },
    shippingAddress: { type: addressSchema, required: true },
    paymentMethod: { type: String, required: true, enum: ['razorpay', 'upi_manual'] },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['paid', 'pending_verification', 'failed', 'refunded'],
      default: 'pending_verification',
    },
    paymentDetails: { type: paymentDetailsSchema },
    orderStatus: {
      type: String,
      required: true,
      enum: ['payment_pending', 'preparing', 'shipped', 'delivered', 'cancelled'],
      default: 'payment_pending',
    },
    trackingNumber: { type: String, trim: true },
  },
  { timestamps: true },
);

orderSchema.pre('validate', function validatePurchaser(next) {
  if (!this.user && !this.guestEmail) {
    this.invalidate('guestEmail', 'An order must include either a user or a guest email address.');
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ guestEmail: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

export const Order = models.Order || model<IOrder>('Order', orderSchema);
