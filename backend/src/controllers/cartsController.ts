import type { RequestHandler } from 'express';
import { z } from 'zod';
import { Cart } from '../models/Cart';
import { addItemToCart, findCart, getCartOwner, mergeGuestCart, updateCartItem } from '../services/cartService';
import { calculatePromoDiscount } from '../services/promoService';
import { HttpError } from '../utils/HttpError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { serializeCart } from '../utils/serializers';

export const addCartItemSchema = z.object({ productId: z.string().regex(/^[a-f\d]{24}$/i), quantity: z.number().int().min(1).max(100), customNote: z.string().trim().max(500).optional() });
export const updateCartItemSchema = z.object({ quantity: z.number().int().min(0).max(100), customNote: z.string().trim().max(500).optional() });
export const cartSettingsSchema = z.object({ giftWrap: z.boolean().optional(), giftNote: z.string().trim().max(500).optional(), promoCode: z.string().trim().max(50).optional().nullable() });
export const mergeCartSchema = z.object({ cartToken: z.string().min(16).max(200) });

export const getCurrentCart: RequestHandler = asyncHandler(async (req, res) => {
  const owner = getCartOwner(req);
  const cart = await findCart(owner);
  const data = cart ? serializeCart(cart) : { ...owner, items: [], giftWrap: false, giftNote: '', promoCode: '' };
  sendSuccess(res, 200, 'Cart retrieved.', data);
});

export const addCartItem: RequestHandler = asyncHandler(async (req, res) => {
  const cart = await addItemToCart(getCartOwner(req), req.body.productId, req.body.quantity, req.body.customNote);
  sendSuccess(res, 200, 'Cart item added.', serializeCart(cart));
});

export const patchCartItem: RequestHandler = asyncHandler(async (req, res) => {
  const cart = await updateCartItem(getCartOwner(req), req.params.productId as string, req.body.quantity, req.body.customNote);
  sendSuccess(res, 200, 'Cart updated.', serializeCart(cart));
});

export const removeCartItem: RequestHandler = asyncHandler(async (req, res) => {
  const cart = await updateCartItem(getCartOwner(req), req.params.productId as string, 0);
  sendSuccess(res, 200, 'Cart item removed.', serializeCart(cart));
});

export const updateCartSettings: RequestHandler = asyncHandler(async (req, res) => {
  const owner = getCartOwner(req);
  const cart = await findCart(owner);
  if (!cart) throw new HttpError(404, 'Cart not found.');
  if (req.body.promoCode) {
    const subtotal = cart.items.reduce((total, item) => total + (item.product as unknown as { price?: number }).price! * item.quantity, 0);
    await calculatePromoDiscount(req.body.promoCode, subtotal);
  }
  const update = { ...req.body };
  if (update.promoCode === null) update.promoCode = undefined;
  Object.assign(cart, update);
  await cart.save();
  sendSuccess(res, 200, 'Cart settings updated.', serializeCart(await cart.populate('items.product')));
});

export const mergeCart: RequestHandler = asyncHandler(async (req, res) => {
  const cart = await mergeGuestCart(req.auth!.userId, req.body.cartToken);
  sendSuccess(res, 200, 'Guest cart merged.', serializeCart(cart));
});

export const clearCurrentCart: RequestHandler = asyncHandler(async (req, res) => {
  const owner = getCartOwner(req);
  await Cart.updateOne(owner, { $set: { items: [], giftWrap: false }, $unset: { giftNote: '', promoCode: '' } });
  sendSuccess(res, 200, 'Cart cleared.', { ...owner, items: [] });
});
