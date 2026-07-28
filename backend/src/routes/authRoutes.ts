import { Router } from 'express';
import { googleLogin, googleSchema, login, loginSchema, register, registerSchema } from '../controllers/authController';
import { validateBody } from '../middleware/validate';

const router = Router();
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/google', validateBody(googleSchema), googleLogin);

export default router;
