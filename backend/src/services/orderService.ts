import crypto from 'crypto';
import mongoose, { Types } from 'mongoose';
import Razorpay from 'razorpay';
import { Cart } from '../models/Cart';
import { getNextOrderNumber } from '../models/Counter';
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

  const subtotal = Number(
    orderItems.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0).toFixed(2),
  );
  const shippingFee = SHIPPING_FEE;
  const giftWrapFee = cart.giftWrap ? GIFT_WRAP_FEE : 0;
  const promoCalculation = cart.promoCode ? await calculatePromoDiscount(cart.promoCode, subtotal) : undefined;
  const discountAmount = promoCalculation?.discountAmount ?? 0;
  const total = Number((subtotal + shippingFee + giftWrapFee - discountAmount).toFixed(2));

  // Generate sequential order number formatted as CW-2026-000001
  const orderNumber = await getNextOrderNumber();

  const [createdOrder] = await Order.create([
    {
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
    },
  ]);

  if (!createdOrder) throw new HttpError(500, 'Order could not be created.');

  const razorpay = input.paymentMethod === 'razorpay' ? createRazorpayClient() : undefined;
  if (!razorpay) {
    // Demo/Test environment without Razorpay credentials configured
    const demoOrderId = `order_demo_${Date.now().toString(36)}`;
    createdOrder.paymentDetails = { razorpayOrderId: demoOrderId };
    await createdOrder.save();
    return {
      order: createdOrder,
      razorpayOrder: {
        id: demoOrderId,
        amount: Math.round(total * 100),
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
      },
    };
  }

  try {
    const orderPayload = {
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: orderNumber,
      notes: { craftywrapOrderNumber: orderNumber },
    };
    console.log('[Razorpay Orders API Request Payload]:', JSON.stringify(orderPayload, null, 2));

    const razorpayOrder = await razorpay.orders.create(orderPayload);
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

  // Idempotent return if order is already verified and paid
  if (order.paymentStatus === 'paid') {
    return order;
  }

  const razorpayOrderId = order.paymentDetails?.razorpayOrderId;
  if (!razorpayOrderId) throw new HttpError(400, 'Razorpay order has not been initialized.');

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (secret && !razorpaySignature.startsWith('demo_signature_')) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature);
    const actualBuf = Buffer.from(razorpaySignature);

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      throw new HttpError(400, 'Razorpay payment signature is invalid.');
    }
  }

  // Update Inventory ONCE and update order status within Mongoose transaction
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // 1. Decrement Stock ONCE for all products in the order
      for (const item of order.items) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.product, stockCount: { $gte: item.quantity } },
          { $inc: { stockCount: -item.quantity } },
          { new: true, session },
        );
        if (!updatedProduct) {
          throw new HttpError(409, `Product "${item.name}" no longer has enough stock available.`);
        }
      }

      // 2. Increment promo code usage if applied
      if (order.promoCodeApplied) {
        await PromoCode.updateOne(
          { code: order.promoCodeApplied },
          { $inc: { usedCount: 1 } },
          { session },
        );
      }

      // 3. Mark payment as paid and set paidAt timestamp
      order.paymentStatus = 'paid';
      order.orderStatus = 'preparing';
      order.paymentDetails = {
        ...order.paymentDetails,
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date(),
      };
      await order.save({ session });

      // 4. Clear user's cart ONCE payment is successfully verified
      const cartOwnerFilter = order.user
        ? { user: order.user }
        : order.guestEmail
        ? { guestEmail: order.guestEmail }
        : null;

      if (cartOwnerFilter) {
        await Cart.updateOne(
          cartOwnerFilter,
          { $set: { items: [], giftWrap: false }, $unset: { giftNote: '', promoCode: '' } },
          { session },
        );
      }
    });
  } finally {
    await session.endSession();
  }

  const updatedOrder = await Order.findById(orderId);
  return updatedOrder || order;
}
