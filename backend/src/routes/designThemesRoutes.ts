import { Router } from 'express';
import { createDesignTheme, deleteDesignTheme, designThemeSchema, listDesignThemes, updateDesignTheme } from '../controllers/designThemesController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();
router.get('/', listDesignThemes);
router.post('/', requireAuth, requireRole('admin'), validateBody(designThemeSchema), createDesignTheme);
router.patch('/:designThemeId', requireAuth, requireRole('admin'), validateBody(designThemeSchema.partial()), updateDesignTheme);
router.delete('/:designThemeId', requireAuth, requireRole('admin'), deleteDesignTheme);

export default router;
