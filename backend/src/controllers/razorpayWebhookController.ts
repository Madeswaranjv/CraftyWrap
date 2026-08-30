import type { Request, RequestHandler, Response } from 'express';
import { processWebhookEvent, verifyWebhookSignature } from '../services/razorpayWebhookService';
import { HttpError } from '../utils/HttpError';
import { asyncHandler } from '../utils/asyncHandler';

interface RequestWithRawBody extends Request {
  rawBody?: Buffer | string;
}

export const handleRazorpayWebhook: RequestHandler = asyncHandler(
  async (req: RequestWithRawBody, res: Response) => {
    const signature = req.headers['x-razorpay-signature'] as string | undefined;

    if (!signature) {
      console.warn('[Razorpay Webhook] Rejected request missing X-Razorpay-Signature header.');
      throw new HttpError(400, 'Missing X-Razorpay-Signature header.');
    }

    // Use rawBody buffer captured during body parsing
    const rawBody = req.rawBody ?? JSON.stringify(req.body);

    const isValidSignature = verifyWebhookSignature(rawBody, signature);
    if (!isValidSignature) {
      console.warn(`[Razorpay Webhook] Invalid webhook signature detected from IP ${req.ip}.`);
      throw new HttpError(400, 'Invalid X-Razorpay-Signature.');
    }

    const result = await processWebhookEvent(req.body);

    res.status(200).json({
      status: 'ok',
      message: result.message,
      ...(result.orderNumber ? { orderNumber: result.orderNumber } : {}),
    });
  },
);
