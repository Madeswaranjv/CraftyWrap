import { Router } from 'express';
import { createProductType, deleteProductType, listProductTypes, productTypeSchema, updateProductType } from '../controllers/productTypesController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();
router.get('/', listProductTypes);
router.post('/', requireAuth, requireRole('admin'), validateBody(productTypeSchema), createProductType);
router.patch('/:productTypeId', requireAuth, requireRole('admin'), validateBody(productTypeSchema.partial()), updateProductType);
router.delete('/:productTypeId', requireAuth, requireRole('admin'), deleteProductType);

export default router;
