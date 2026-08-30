import crypto from 'crypto';
import mongoose from 'mongoose';
import { Cart } from '../models/Cart';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { PromoCode } from '../models/PromoCode';
import { WebhookEvent } from '../models/WebhookEvent';
import { HttpError } from '../utils/HttpError';

export function verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET environment variable is not configured.');
    return false;
  }
  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const expectedBuf = Buffer.from(expectedSignature);
  const actualBuf = Buffer.from(signature);

  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export async function isEventProcessed(eventId: string): Promise<boolean> {
  const existing = await WebhookEvent.findOne({ eventId });
  return Boolean(existing);
}

export async function recordProcessedEvent(
  eventId: string,
  eventType: string,
  summary?: Record<string, any>,
): Promise<void> {
  try {
    await WebhookEvent.create({
      eventId,
      eventType,
      processedAt: new Date(),
      payloadSummary: summary,
    });
  } catch (error: any) {
    // Duplicate key error is acceptable for concurrency
    if (error.code !== 11000) {
      console.error('[Razorpay Webhook] Failed to store webhook event:', error);
    }
  }
}

export interface WebhookProcessingResult {
  status: 'success' | 'ignored' | 'failed' | 'already_processed';
  message: string;
  orderNumber?: string;
}

export async function processWebhookEvent(payload: any): Promise<WebhookProcessingResult> {
  const eventId = payload.event_id || payload.id;
  const eventType = payload.event;

  if (!eventId || !eventType) {
    throw new HttpError(400, 'Invalid webhook payload structure: missing event or event_id.');
  }

  // Idempotency Check
  const alreadyProcessed = await isEventProcessed(eventId);
  if (alreadyProcessed) {
    console.log(`[Razorpay Webhook] Event ${eventId} (${eventType}) was already processed. Skipping business logic.`);
    return { status: 'already_processed', message: 'Event already processed.' };
  }

  let result: WebhookProcessingResult = { status: 'ignored', message: `Event ${eventType} acknowledged.` };

  try {
    switch (eventType) {
      case 'payment.captured':
      case 'order.paid': {
        const paymentEntity = payload.payload?.payment?.entity;
        const orderEntity = payload.payload?.order?.entity;

        const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
        const razorpayPaymentId = paymentEntity?.id || orderEntity?.payment_id;
        const amountInPaise = paymentEntity?.amount ?? orderEntity?.amount;
        const currency = paymentEntity?.currency ?? orderEntity?.currency ?? 'INR';

        if (!razorpayOrderId) {
          console.warn(`[Razorpay Webhook] ${eventType} payload missing razorpayOrderId.`);
          result = { status: 'ignored', message: 'Missing razorpayOrderId in payload.' };
          break;
        }

        const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpayOrderId });
        if (!order) {
          console.warn(`[Razorpay Webhook] No CraftyWrap order found matching Razorpay Order ID: ${razorpayOrderId}`);
          result = { status: 'ignored', message: `CraftyWrap order not found for ${razorpayOrderId}` };
          break;
        }

        // Amount and currency validation
        const expectedPaise = Math.round(order.total * 100);
        if (amountInPaise !== undefined && amountInPaise !== expectedPaise) {
          console.error(
            `[Razorpay Webhook] Amount mismatch for Order #${order.orderNumber}. Expected: ${expectedPaise} paise, Received: ${amountInPaise} paise.`,
          );
          order.paymentDetails = {
            ...order.paymentDetails,
            failureReason: `Webhook amount mismatch: expected ${expectedPaise}, received ${amountInPaise}`,
          };
          await order.save();
          result = { status: 'failed', message: 'Payment amount mismatch.', orderNumber: order.orderNumber };
          break;
        }

        if (currency !== 'INR') {
          console.error(`[Razorpay Webhook] Invalid currency ${currency} for Order #${order.orderNumber}.`);
          result = { status: 'failed', message: 'Invalid currency.', orderNumber: order.orderNumber };
          break;
        }

        // Execute atomic transaction for payment status & single inventory decrement
        const session = await mongoose.startSession();
        try {
          await session.withTransaction(async () => {
            const currentOrder = await Order.findById(order._id).session(session);
            if (!currentOrder) return;

            const isFirstPaymentVerification = currentOrder.paymentStatus !== 'paid';

            if (isFirstPaymentVerification) {
              // Decrement Stock ONCE
              for (const item of currentOrder.items) {
                const updatedProduct = await Product.findOneAndUpdate(
                  { _id: item.product, stockCount: { $gte: item.quantity } },
                  { $inc: { stockCount: -item.quantity } },
                  { new: true, session },
                );
                if (!updatedProduct) {
                  console.warn(`[Razorpay Webhook] Stock deduction warning for product "${item.name}" on Order #${currentOrder.orderNumber}`);
                }
              }

              if (currentOrder.promoCodeApplied) {
                await PromoCode.updateOne(
                  { code: currentOrder.promoCodeApplied },
                  { $inc: { usedCount: 1 } },
                  { session },
                );
              }
            }

            currentOrder.paymentStatus = 'paid';
            currentOrder.orderStatus = 'preparing';
            currentOrder.paymentDetails = {
              ...currentOrder.paymentDetails,
              razorpayPaymentId: razorpayPaymentId || currentOrder.paymentDetails?.razorpayPaymentId,
              paidAt: currentOrder.paymentDetails?.paidAt || new Date(),
            };
            await currentOrder.save({ session });

            // Clear Cart ONCE payment is confirmed
            const cartFilter = currentOrder.user
              ? { user: currentOrder.user }
              : currentOrder.guestEmail
              ? { guestEmail: currentOrder.guestEmail }
              : null;

            if (cartFilter) {
              await Cart.updateOne(
                cartFilter,
                { $set: { items: [], giftWrap: false }, $unset: { giftNote: '', promoCode: '' } },
                { session },
              );
            }
          });
        } finally {
          await session.endSession();
        }

        console.log(`[Razorpay Webhook] Received event: ${eventType}`);
        console.log(`[Razorpay Webhook] Razorpay Order: ${razorpayOrderId}`);
        console.log(`[Razorpay Webhook] CraftyWrap Order: ${order.orderNumber}`);
        console.log(`[Razorpay Webhook] Payment confirmed`);

        result = { status: 'success', message: 'Payment confirmed successfully.', orderNumber: order.orderNumber };
        break;
      }

      case 'payment.failed': {
        const paymentEntity = payload.payload?.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id;
        const razorpayPaymentId = paymentEntity?.id;
        const errorDescription = paymentEntity?.error_description || 'Payment failed at Razorpay checkout.';

        if (razorpayOrderId) {
          const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpayOrderId });
          if (order && order.paymentStatus !== 'paid') {
            order.paymentStatus = 'failed';
            order.paymentDetails = {
              ...order.paymentDetails,
              razorpayPaymentId: razorpayPaymentId || order.paymentDetails?.razorpayPaymentId,
              failureReason: errorDescription,
            };
            await order.save();
            console.log(`[Razorpay Webhook] Payment failed for CraftyWrap Order: ${order.orderNumber} (${errorDescription})`);
            result = { status: 'success', message: 'Payment failure recorded.', orderNumber: order.orderNumber };
          }
        }
        break;
      }

      default:
        console.log(`[Razorpay Webhook] Received unhandled event type: ${eventType}. Acknowledging event.`);
        result = { status: 'ignored', message: `Unhandled event type ${eventType} acknowledged.` };
        break;
    }

    // Record event ID to guarantee idempotency across restarts
    await recordProcessedEvent(eventId, eventType, {
      orderNumber: result.orderNumber,
      status: result.status,
    });
  } catch (error) {
    console.error(`[Razorpay Webhook] Error processing event ${eventId}:`, error);
    throw error;
  }

  return result;
}
