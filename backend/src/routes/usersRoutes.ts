import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { getMyProfile, getWishlist, listUsers, setDefaultAddress, toggleWishlistProduct, updateMyProfile, updateProfileSchema, updateUserAsAdmin } from '../controllers/usersController';

const router = Router();
router.get('/me', requireAuth, getMyProfile);
router.patch('/me', requireAuth, validateBody(updateProfileSchema), updateMyProfile);
router.patch('/me/addresses/:addressIndex/default', requireAuth, setDefaultAddress);
router.get('/me/wishlist', requireAuth, getWishlist);
router.put('/me/wishlist/:productId', requireAuth, toggleWishlistProduct);
router.get('/admin', requireAuth, requireRole('admin'), listUsers);
router.patch('/admin/:userId', requireAuth, requireRole('admin'), updateUserAsAdmin);

export default router;
