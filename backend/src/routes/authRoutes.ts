import { Router } from 'express';
import { getMe, googleLogin, googleSchema, login, loginSchema, logoutHandler, register, registerSchema } from '../controllers/authController';
import { validateBody } from '../middleware/validate';

const router = Router();
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/google', validateBody(googleSchema), googleLogin);
router.get('/me', getMe);
router.post('/logout', logoutHandler);

export default router;
