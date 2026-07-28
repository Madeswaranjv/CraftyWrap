import type { RequestHandler } from 'express';
import { z } from 'zod';
import { uploadToCloudinary } from '../config/cloudinary';
import { CustomOrderRequest } from '../models/CustomOrderRequest';
import { HttpError } from '../utils/HttpError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const customOrderSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6).max(25),
  yarnPreference: z.string().trim().max(100).optional(),
  budgetRange: z.string().trim().max(100).optional(),
  description: z.string().trim().min(10).max(5000),
  referenceDollSlug: z.string().trim().max(160).optional(),
});
export const customOrderAdminSchema = z.object({ status: z.string().trim().min(2).max(80).optional(), artisanNotes: z.string().trim().max(5000).optional() });

export const createCustomOrder: RequestHandler = asyncHandler(async (req, res) => {
  const referenceImageUrl = req.file
    ? (await uploadToCloudinary(req.file.buffer, 'craftywrap/custom-orders')).secureUrl
    : undefined;
  const request = await CustomOrderRequest.create({ ...req.body, ...(req.auth ? { user: req.auth.userId } : {}), referenceImageUrl });
  sendSuccess(res, 201, 'Custom order request submitted.', request);
});

export const getMyCustomOrders: RequestHandler = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Custom order requests retrieved.', await CustomOrderRequest.find({ user: req.auth!.userId }).sort({ createdAt: -1 }));
});

export const listCustomOrders: RequestHandler = asyncHandler(async (_req, res) => {
  sendSuccess(res, 200, 'Custom order requests retrieved.', await CustomOrderRequest.find().sort({ createdAt: -1 }).populate('user', 'name email'));
});

export const updateCustomOrderAsAdmin: RequestHandler = asyncHandler(async (req, res) => {
  const request = await CustomOrderRequest.findByIdAndUpdate(req.params.customOrderId, { $set: req.body }, { new: true, runValidators: true });
  if (!request) throw new HttpError(404, 'Custom order request not found.');
  sendSuccess(res, 200, 'Custom order request updated.', request);
});
