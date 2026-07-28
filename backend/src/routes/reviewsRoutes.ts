import { Router } from 'express';
import { createReview, deleteReviewAsAdmin, listProductReviews, listReviews, reviewAdminSchema, reviewSchema, updateReviewAsAdmin } from '../controllers/reviewsController';
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validateBody } from '../middleware/validate';

const router = Router();
router.get('/', requireAuth, requireRole('admin'), listReviews);
router.get('/product/:slug', listProductReviews);
router.post('/product/:slug', optionalAuth, upload.single('image'), validateBody(reviewSchema), createReview);
router.patch('/:reviewId', requireAuth, requireRole('admin'), validateBody(reviewAdminSchema), updateReviewAsAdmin);
router.delete('/:reviewId', requireAuth, requireRole('admin'), deleteReviewAsAdmin);

export default router;
