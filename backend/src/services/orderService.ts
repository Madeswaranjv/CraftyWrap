import crypto from 'crypto';
import mongoose, { Types } from 'mongoose';
import Razorpay from 'razorpay';
import { Cart } from '../models/Cart';
import { IAddress } from '../models/shared';
import { Order, OrderDocument, PaymentMethod } from '../models/Order';
import { Product } from '../models/Product';
import { PromoCode } from '../models/PromoCode';
import { calculatePromoDiscount } from './promoService';
import { CartOwner } from './cartService';
import { HttpError } from '../utils/HttpError';

const GIFT_WRAP_FEE = 49;
const SHIPPING_FEE = 50;

export interface CheckoutInput {
  owner: CartOwner;
  guestEmail?: string;
  shippingAddress: IAddress;
  paymentMethod: PaymentMethod;
}

export interface CheckoutResult {
  order: OrderDocument;
  razorpayOrder?: { id: string; amount: number; currency: string; keyId: string };
}

function makeOrderNumber(): string {
  return `CW-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function createRazorpayClient(): Razorpay | undefined {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return keyId && keySecret ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : undefined;
}

export async function createOrderFromCart(input: CheckoutInput): Promise<CheckoutResult> {
  const cart = await Cart.findOne(input.owner).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new HttpError(400, 'Your cart is empty.');
  }
  if (!input.owner.user && !input.guestEmail) {
    throw new HttpError(400, 'Guest email is required for guest checkout.');
  }

  const cartItems = cart.items as unknown as Array<{
    product: { _id: { toString(): string } };
    quantity: number;
    customNote?: string;
  }>;
  const productIds = cartItems.map((item) => item.product._id);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productsById = new Map(products.map((product) => [product._id.toString(), product]));
  const orderItems = cartItems.map((cartItem) => {
    const product = productsById.get(cartItem.product._id.toString());
    if (!product) throw new HttpError(409, 'One or more products are no longer available.');
    if (cartItem.quantity > product.stockCount) {
      throw new HttpError(409, `${product.name} no longer has enough stock.`);
    }
    return {
      product: product._id,
      name: product.name,
      productType: product.productType,
      designTheme: product.designTheme,
      yarnType: product.yarnType,
      size: product.size,
      price: product.price,
      quantity: cartItem.quantity,
      customNote: cartItem.customNote,
    };
  });

  const subtotal = Number(orderItems.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0).toFixed(2));
  const shippingFee = SHIPPING_FEE;
  const giftWrapFee = cart.giftWrap ? GIFT_WRAP_FEE : 0;
  const promoCalculation = cart.promoCode ? await calculatePromoDiscount(cart.promoCode, subtotal) : undefined;
  const discountAmount = promoCalculation?.discountAmount ?? 0;
  const total = Number((subtotal + shippingFee + giftWrapFee - discountAmount).toFixed(2));
  const orderNumber = makeOrderNumber();
  const session = await mongoose.startSession();
  let createdOrder: OrderDocument | undefined;

  try {
    await session.withTransaction(async () => {
      for (const item of orderItems) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.product, stockCount: { $gte: item.quantity }, isActive: true },
          { $inc: { stockCount: -item.quantity } },
          { new: true, session },
        );
        if (!updatedProduct) {
          throw new HttpError(409, `${item.name} is no longer available in the requested quantity.`);
        }
      }

      if (promoCalculation) {
        const promoUpdate = await PromoCode.updateOne(
          {
            _id: promoCalculation.promo._id,
            $or: [{ usageLimit: { $exists: false } }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
          },
          { $inc: { usedCount: 1 } },
          { session },
        );
        if (promoUpdate.modifiedCount !== 1) {
          throw new HttpError(409, 'Promo code usage limit has been reached.');
        }
      }

      const [order] = await Order.create(
        [{
          orderNumber,
          ...(input.owner.user ? { user: new Types.ObjectId(input.owner.user) } : {}),
          ...(input.guestEmail ? { guestEmail: input.guestEmail.toLowerCase() } : {}),
          items: orderItems,
          subtotal,
          shippingFee,
          giftWrapFee,
          discountAmount,
          promoCodeApplied: promoCalculation?.promo.code,
          total,
          giftWrap: cart.giftWrap,
          giftNote: cart.giftNote,
          shippingAddress: input.shippingAddress,
          paymentMethod: input.paymentMethod,
          paymentStatus: 'pending_verification',
          orderStatus: 'payment_pending',
        }],
        { session },
      );
      createdOrder = order;
      await Cart.updateOne({ _id: cart._id }, { $set: { items: [], giftWrap: false }, $unset: { giftNote: '', promoCode: '' } }, { session });
    });
  } finally {
    await session.endSession();
  }

  if (!createdOrder) throw new HttpError(500, 'Order could not be created.');

  const razorpay = input.paymentMethod === 'razorpay' ? createRazorpayClient() : undefined;
  if (!razorpay) return { order: createdOrder };

  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: orderNumber,
      notes: { craftywrapOrderNumber: orderNumber },
    });
    createdOrder.paymentDetails = { razorpayOrderId: razorpayOrder.id };
    await createdOrder.save();
    return {
      order: createdOrder,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: Number(razorpayOrder.amount),
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID as string,
      },
    };
  } catch (error) {
    await Order.updateOne(
      { _id: createdOrder._id },
      { $set: { paymentStatus: 'failed', orderStatus: 'payment_pending', 'paymentDetails.failureReason': 'Unable to initialize Razorpay payment.' } },
    );
    throw new HttpError(502, 'Unable to initialize Razorpay payment.');
  }
}

export async function verifyRazorpayPayment(
  orderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): Promise<OrderDocument> {
  const order = await Order.findById(orderId);
  if (!order) throw new HttpError(404, 'Order not found.');
  if (order.paymentMethod !== 'razorpay') throw new HttpError(400, 'This order does not use Razorpay.');
  if (!order.paymentDetails?.razorpayOrderId) throw new HttpError(400, 'Razorpay order has not been initialized.');
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new HttpError(500, 'Razorpay is not configured.');

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${order.paymentDetails.razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpaySignature))) {
    throw new HttpError(400, 'Razorpay payment signature is invalid.');
  }

  order.paymentStatus = 'paid';
  order.orderStatus = 'preparing';
  order.paymentDetails = {
    ...order.paymentDetails,
    razorpayPaymentId,
    razorpaySignature,
    paidAt: new Date(),
  };
  await order.save();
  return order;
}
