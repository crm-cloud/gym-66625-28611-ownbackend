import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';
import { initializeStorage, UPLOAD_DIR } from './config/storage';
import { initializeEmailService } from './config/email';

// Load environment variables
dotenv.config();

// Initialize services
initializeStorage().catch(console.error);
initializeEmailService();

// Import routes
import authRoutes from './routes/auth.routes';
import memberRoutes from './routes/member.routes';
import branchRoutes from './routes/branch.routes';
import trainerRoutes from './routes/trainer.routes';
import membershipRoutes from './routes/membership.routes';
import classRoutes from './routes/class.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import attendanceRoutes from './routes/attendance.routes';
import transactionRoutes from './routes/transaction.routes';
import lockerRoutes from './routes/locker.routes';
import equipmentRoutes from './routes/equipment.routes';
import dietWorkoutRoutes from './routes/diet-workout.routes';
import feedbackRoutes from './routes/feedback.routes';
import announcementRoutes from './routes/announcement.routes';
import referralRoutes from './routes/referral.routes';
// Phase 6-8: User, Role, Payment, Subscription Management
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import paymentRoutes from './routes/payment.routes';
import subscriptionRoutes from './routes/subscription.routes';
import invoiceRoutes from './routes/invoice.routes';
// Phase 9-10: Trainer Advanced & Multi-Tenancy
import assignmentRoutes from './routes/assignment.routes';
import packageRoutes from './routes/package.routes';
import trainerChangeRoutes from './routes/trainer-change.routes';
import trainerReviewRoutes from './routes/trainer-review.routes';
import gymRoutes from './routes/gym.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import leadRoutes from './routes/lead.routes';
// Phase 11-12: Member Progress & Task Management
import memberProgressRoutes from './routes/member-progress.routes';
import taskRoutes from './routes/task.routes';
// Phase 1 Migration: Member Credits & Membership Freeze
import memberCreditsRoutes from './routes/member-credits.routes';
import membershipFreezeRoutes from './routes/membership-freeze.routes';
import memberGoalsRoutes from './routes/member-goals.routes';
import analyticsEventsRoutes from './routes/analytics-events.routes';
import teamRoutes from './routes/team.routes';
import templatesRoutes from './routes/templates.routes';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (required for rate limiting behind reverse proxies)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(logger);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', UPLOAD_DIR)));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/membership-plans', membershipRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/lockers', lockerRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/plans', dietWorkoutRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/referrals', referralRoutes);
// Phase 6-8: User, Role, Payment, Subscription Management
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/invoices', invoiceRoutes);
// Phase 9-10: Trainer Advanced & Multi-Tenancy
app.use('/api/assignments', assignmentRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/trainer-changes', trainerChangeRoutes);
app.use('/api/trainer-reviews', trainerReviewRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/leads', leadRoutes);
// Phase 11-12: Member Progress & Task Management
app.use('/api/progress', memberProgressRoutes);
app.use('/api/tasks', taskRoutes);
// Phase 1 Migration: Member Credits & Membership Freeze
app.use('/api/member-credits', memberCreditsRoutes);
app.use('/api/membership-freeze', membershipFreezeRoutes);
app.use('/api/member-goals', memberGoalsRoutes);
app.use('/api/analytics', analyticsEventsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/templates', templatesRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    path: req.path
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Fitverse Backend API running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`\n✅ Server ready at http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
