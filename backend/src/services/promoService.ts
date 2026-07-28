import { PromoCode, PromoCodeDocument } from '../models/PromoCode';
import { HttpError } from '../utils/HttpError';

export interface PromoCalculation {
  promo: PromoCodeDocument;
  discountAmount: number;
}

export async function calculatePromoDiscount(code: string, subtotal: number): Promise<PromoCalculation> {
  const normalizedCode = code.trim().toUpperCase();
  const promo = await PromoCode.findOne({ code: normalizedCode, isActive: true });

  if (!promo) {
    throw new HttpError(404, 'Promo code is not valid.');
  }
  if (promo.expiryDate && promo.expiryDate.getTime() < Date.now()) {
    throw new HttpError(400, 'Promo code has expired.');
  }
  if (promo.usageLimit !== undefined && promo.usedCount >= promo.usageLimit) {
    throw new HttpError(400, 'Promo code usage limit has been reached.');
  }
  if (subtotal < (promo.minSubtotal ?? 0)) {
    throw new HttpError(400, `This promo code requires a minimum subtotal of ${promo.minSubtotal ?? 0}.`);
  }

  const rawDiscount = promo.discountType === 'percentage'
    ? (subtotal * promo.discountValue) / 100
    : promo.discountValue;
  const discountAmount = Math.min(rawDiscount, promo.maxDiscount ?? rawDiscount, subtotal);

  return { promo, discountAmount: Number(discountAmount.toFixed(2)) };
}
