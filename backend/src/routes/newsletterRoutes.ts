import { Router } from 'express';
import { newsletterSchema, subscribeNewsletter } from '../controllers/newsletterController';
import { validateBody } from '../middleware/validate';

const router = Router();
router.post('/', validateBody(newsletterSchema), subscribeNewsletter);

export default router;
