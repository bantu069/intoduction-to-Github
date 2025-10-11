import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db';
import authRoutes from './routes/auth';
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import reviewRoutes from './routes/reviews';
import adminRoutes from './routes/admin';

const app = express();
app.use(cors());
app.use(express.json());

initializeDatabase();

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});
