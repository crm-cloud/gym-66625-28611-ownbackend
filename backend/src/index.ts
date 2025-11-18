import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import branchRoutes from './routes/branch.routes';
import gymRoutes from './routes/gym.routes';
import memberRoutes from './routes/member.routes';
import trainerRoutes from './routes/trainer.routes';
import classRoutes from './routes/class.routes';
import membershipPlanRoutes from './routes/membership-plan.routes';
import financeRoutes from './routes/finance.routes';
import equipmentRoutes from './routes/equipment.routes';
import lockerRoutes from './routes/locker.routes';
import productRoutes from './routes/product.routes';
import referralRoutes from './routes/referral.routes';
import feedbackRoutes from './routes/feedback.routes';
import settingsRoutes from './routes/settings.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminSubscriptionRoutes from './routes/admin-subscription.routes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/membership-plans', membershipPlanRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/lockers', lockerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin-subscriptions', adminSubscriptionRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 API base: http://localhost:${PORT}/api`);
});

export default app;
