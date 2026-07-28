import { Router } from 'express';
import { addCartItem, addCartItemSchema, clearCurrentCart, getCurrentCart, mergeCart, mergeCartSchema, patchCartItem, removeCartItem, updateCartItemSchema, updateCartSettings, cartSettingsSchema } from '../controllers/cartsController';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();
router.get('/current', optionalAuth, getCurrentCart);
router.post('/items', optionalAuth, validateBody(addCartItemSchema), addCartItem);
router.patch('/items/:productId', optionalAuth, validateBody(updateCartItemSchema), patchCartItem);
router.delete('/items/:productId', optionalAuth, removeCartItem);
router.patch('/current', optionalAuth, validateBody(cartSettingsSchema), updateCartSettings);
router.delete('/current', optionalAuth, clearCurrentCart);
router.post('/merge', requireAuth, validateBody(mergeCartSchema), mergeCart);

export default router;
