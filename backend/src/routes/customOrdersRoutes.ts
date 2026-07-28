import { Router } from 'express';
import { createCustomOrder, customOrderAdminSchema, customOrderSchema, getMyCustomOrders, listCustomOrders, updateCustomOrderAsAdmin } from '../controllers/customOrdersController';
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validateBody } from '../middleware/validate';

const router = Router();
router.post('/', optionalAuth, upload.single('referenceImage'), validateBody(customOrderSchema), createCustomOrder);
router.get('/me', requireAuth, getMyCustomOrders);
router.get('/', requireAuth, requireRole('admin'), listCustomOrders);
router.patch('/:customOrderId', requireAuth, requireRole('admin'), validateBody(customOrderAdminSchema), updateCustomOrderAsAdmin);

export default router;
