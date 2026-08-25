import { Router } from 'express';
import {
  autocompleteProducts,
  clearAllProducts,
  createProduct,
  deactivateProduct,
  deleteProductPermanently,
  getProductBySlug,
  getRelatedProducts,
  listProducts,
  productPayloadSchema,
  updateProduct,
} from '../controllers/productsController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();
router.get('/', listProducts);
router.get('/autocomplete', autocompleteProducts);
router.delete('/clear-all', requireAuth, requireRole('admin'), clearAllProducts);
router.post('/', requireAuth, requireRole('admin'), validateBody(productPayloadSchema), createProduct);
router.patch('/:productId', requireAuth, requireRole('admin'), validateBody(productPayloadSchema.partial()), updateProduct);
router.delete('/:productId/permanent', requireAuth, requireRole('admin'), deleteProductPermanently);
router.delete('/:productId', requireAuth, requireRole('admin'), deactivateProduct);
router.get('/:slug/related', getRelatedProducts);
router.get('/:slug', getProductBySlug);

export default router;

