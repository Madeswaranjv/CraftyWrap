import cors from 'cors';
import express from 'express';
import { errorHandler, notFound } from './middleware/errorHandler';
import cartsRoutes from './routes/cartsRoutes';
import customOrdersRoutes from './routes/customOrdersRoutes';
import designThemesRoutes from './routes/designThemesRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import ordersRoutes from './routes/ordersRoutes';
import productTypesRoutes from './routes/productTypesRoutes';
import productsRoutes from './routes/productsRoutes';
import promoCodesRoutes from './routes/promoCodesRoutes';
import reviewsRoutes from './routes/reviewsRoutes';
import usersRoutes from './routes/usersRoutes';
import authRoutes from './routes/authRoutes';
import razorpayRoutes from './routes/razorpayRoutes';

const app = express();

const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://craftywrap.com',
  'https://www.craftywrap.com',
];

const envOrigins = (process.env.FRONTEND_URL ?? process.env.FRONTEND_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Cart-Token', 'X-Razorpay-Signature'],
}));
app.use(
  express.json({
    limit: '50mb',
    verify: (req, _res, buf) => {
      if (buf && buf.length) {
        (req as any).rawBody = buf;
      }
    },
  }),
);
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Service is healthy.', data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/product-types', productTypesRoutes);
app.use('/api/design-themes', designThemesRoutes);
app.use('/api/carts', cartsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/custom-orders', customOrdersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/promo-codes', promoCodesRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
