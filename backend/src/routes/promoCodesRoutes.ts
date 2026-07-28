import { Router } from 'express';
import { createPromoCode, deletePromoCode, listPromoCodes, promoCodeSchema, promoValidationSchema, updatePromoCode, validatePromoCode } from '../controllers/promoCodesController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();
router.post('/validate', validateBody(promoValidationSchema), validatePromoCode);
router.get('/', requireAuth, requireRole('admin'), listPromoCodes);
router.post('/', requireAuth, requireRole('admin'), validateBody(promoCodeSchema), createPromoCode);
router.patch('/:promoCodeId', requireAuth, requireRole('admin'), validateBody(promoCodeSchema.partial()), updatePromoCode);
router.delete('/:promoCodeId', requireAuth, requireRole('admin'), deletePromoCode);

export default router;
