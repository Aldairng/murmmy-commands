import express from 'express';
import cors from 'cors';
import path from 'path';
import { init } from './db';
import { verifyToken } from './auth';
import authRoutes from './routes/auth.routes';
import eventsRoutes from './routes/events.routes';
import tablesRoutes from './routes/tables.routes';
import cerealsRoutes from './routes/cereals.routes';
import toppingsRoutes from './routes/toppings.routes';
import syrupsRoutes from './routes/syrups.routes';
import favoritesRoutes from './routes/favorites.routes';
import ordersRoutes from './routes/orders.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// SSE (auth via query param)
app.use('/api/events', eventsRoutes);

// Protected routes
app.use('/api/tables', verifyToken, tablesRoutes);
app.use('/api/cereals', verifyToken, cerealsRoutes);
app.use('/api/toppings', verifyToken, toppingsRoutes);
app.use('/api/syrups', verifyToken, syrupsRoutes);
app.use('/api/favorites', verifyToken, favoritesRoutes);
app.use('/api/orders', verifyToken, ordersRoutes);

// Serve static files in production
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Initialize database and start server
init();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Murmmy Commandas server running on http://0.0.0.0:${PORT}`);
});
