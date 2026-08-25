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

const app = express();
const frontendOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || frontendOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Cart-Token'],
}));
app.use(express.json({ limit: '50mb' }));
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
app.use('/api/custom-orders', customOrdersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/promo-codes', promoCodesRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
