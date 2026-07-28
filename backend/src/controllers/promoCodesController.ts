import type { RequestHandler } from 'express';
import { z } from 'zod';
import { PromoCode } from '../models/PromoCode';
import { calculatePromoDiscount } from '../services/promoService';
import { HttpError } from '../utils/HttpError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const promoValidationSchema = z.object({ code: z.string().trim().min(1).max(50), subtotal: z.number().nonnegative() });
export const promoCodeSchema = z.object({ code: z.string().trim().min(2).max(50), discountType: z.enum(['percentage', 'fixed_amount']), discountValue: z.number().positive(), minSubtotal: z.number().nonnegative().optional(), maxDiscount: z.number().positive().optional(), usageLimit: z.number().int().positive().optional(), expiryDate: z.coerce.date().optional(), isActive: z.boolean().optional() });
export const validatePromoCode: RequestHandler = asyncHandler(async (req, res) => {
  const { promo, discountAmount } = await calculatePromoDiscount(req.body.code, req.body.subtotal);
  sendSuccess(res, 200, 'Promo code is valid.', { code: promo.code, discountAmount, discountType: promo.discountType, discountValue: promo.discountValue });
});
export const listPromoCodes: RequestHandler = asyncHandler(async (_req, res) => {
  sendSuccess(res, 200, 'Promo codes retrieved.', await PromoCode.find().sort({ createdAt: -1 }));
});
export const createPromoCode: RequestHandler = asyncHandler(async (req, res) => {
  sendSuccess(res, 201, 'Promo code created.', await PromoCode.create(req.body));
});
export const updatePromoCode: RequestHandler = asyncHandler(async (req, res) => {
  const promo = await PromoCode.findByIdAndUpdate(req.params.promoCodeId, { $set: req.body }, { new: true, runValidators: true });
  if (!promo) throw new HttpError(404, 'Promo code not found.');
  sendSuccess(res, 200, 'Promo code updated.', promo);
});
export const deletePromoCode: RequestHandler = asyncHandler(async (req, res) => {
  const promo = await PromoCode.findByIdAndDelete(req.params.promoCodeId);
  if (!promo) throw new HttpError(404, 'Promo code not found.');
  sendSuccess(res, 200, 'Promo code deleted.', { id: promo._id.toString() });
});
