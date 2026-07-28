import type { RequestHandler } from 'express';
import { z } from 'zod';
import { NewsletterSubscriber } from '../models/NewsletterSubscriber';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const newsletterSchema = z.object({ email: z.string().trim().email(), source: z.enum(['footer', 'homepage_banner']) });
export const subscribeNewsletter: RequestHandler = asyncHandler(async (req, res) => {
  const subscriber = await NewsletterSubscriber.findOneAndUpdate(
    { email: req.body.email.toLowerCase() },
    { $set: { email: req.body.email.toLowerCase(), source: req.body.source, subscribedAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  );
  sendSuccess(res, 200, 'Newsletter subscription saved.', subscriber);
});
