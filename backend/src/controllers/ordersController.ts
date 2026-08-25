import type { RequestHandler } from 'express';
import { z } from 'zod';
import { Order } from '../models/Order';
import { getCartOwner } from '../services/cartService';
import { createOrderFromCart, verifyRazorpayPayment } from '../services/orderService';
import { HttpError } from '../utils/HttpError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const shippingAddressSchema = z.object({
  label: z.string().trim().max(50).optional(),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(25),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z.string().trim().min(3).max(20),
});
export const checkoutSchema = z.object({ guestEmail: z.string().trim().email().optional(), shippingAddress: shippingAddressSchema, paymentMethod: z.enum(['razorpay']) });
export const razorpayVerificationSchema = z.object({ razorpayPaymentId: z.string().min(1), razorpaySignature: z.string().min(1) });
export const orderStatusSchema = z.object({ orderStatus: z.enum(['payment_pending', 'preparing', 'shipped', 'delivered', 'cancelled']).optional(), paymentStatus: z.enum(['paid', 'pending_verification', 'failed', 'refunded']).optional(), trackingNumber: z.string().trim().max(120).optional() });

export const checkout: RequestHandler = asyncHandler(async (req, res) => {
  const result = await createOrderFromCart({ ...req.body, owner: getCartOwner(req) });
  sendSuccess(res, 201, 'Order created.', result);
});

export const verifyPayment: RequestHandler = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new HttpError(404, 'Order not found.');
  if (req.auth && order.user?.toString() !== req.auth.userId && req.auth.role !== 'admin') throw new HttpError(403, 'You do not have permission to verify this order.');
  const updatedOrder = await verifyRazorpayPayment(req.params.orderId as string, req.body.razorpayPaymentId, req.body.razorpaySignature);
  sendSuccess(res, 200, 'Payment verified.', updatedOrder);
});

export const getMyOrders: RequestHandler = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.auth!.userId }).sort({ createdAt: -1 });
  sendSuccess(res, 200, 'Orders retrieved.', orders);
});

export const listOrders: RequestHandler = asyncHandler(async (_req, res) => {
  sendSuccess(res, 200, 'Orders retrieved.', await Order.find().sort({ createdAt: -1 }).populate('user', 'name email'));
});

export const updateOrderAsAdmin: RequestHandler = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.orderId, { $set: req.body }, { new: true, runValidators: true });
  if (!order) throw new HttpError(404, 'Order not found.');
  sendSuccess(res, 200, 'Order updated.', order);
});
