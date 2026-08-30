import { Router } from 'express';
import { handleRazorpayWebhook } from '../controllers/razorpayWebhookController';

const router = Router();

// Public endpoint for Razorpay Webhooks: POST /api/razorpay/webhook
router.post('/webhook', handleRazorpayWebhook);

export default router;
