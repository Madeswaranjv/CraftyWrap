import { Router } from 'express';
import { checkout, checkoutSchema, getMyOrders, listOrders, orderStatusSchema, razorpayVerificationSchema, updateOrderAsAdmin, verifyPayment } from '../controllers/ordersController';
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();
router.post('/checkout', optionalAuth, validateBody(checkoutSchema), checkout);
router.post('/:orderId/verify-payment', optionalAuth, validateBody(razorpayVerificationSchema), verifyPayment);
router.get('/me', requireAuth, getMyOrders);
router.get('/', requireAuth, requireRole('admin'), listOrders);
router.patch('/:orderId', requireAuth, requireRole('admin'), validateBody(orderStatusSchema), updateOrderAsAdmin);

export default router;
