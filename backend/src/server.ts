import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import swaggerUi from 'swagger-ui-express';

// Get the current module's directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import passport from './config/passport';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';
import { transformResponse, addPaginationHelper } from './middleware/transformer';
import { generalLimiter } from './middleware/rateLimiter';
import { ipWhitelist, adminIpWhitelist } from './middleware/ipWhitelist';
import { initializeStorage, UPLOAD_DIR } from './config/storage';
import { initializeEmailService } from './config/email';
import { swaggerDefinition } from './config/swagger';

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
import userManagementRoutes from './routes/user-management.routes';
// Phase 13: API Architecture & Auth Enhancements
import mfaRoutes from './routes/mfa.routes';
import oauthRoutes from './routes/oauth.routes';
import aiPlanGeneratorRoutes from './routes/ai-plan-generator.routes';

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

// Initialize Passport
app.use(passport.initialize());

// Request logging
app.use(logger);

// Response transformation middleware
app.use(transformResponse);
app.use(addPaginationHelper);

// Serve static files (uploads)
app.use('/uploads', express.static(join(__dirname, '..', UPLOAD_DIR)));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'GymFlow API Documentation',
}));

// API v1 routes with versioning
const v1Router = express.Router();

// Apply general rate limiter to all v1 routes
v1Router.use(generalLimiter);

// Public routes (no IP restrictions)
v1Router.use('/auth', authRoutes);
v1Router.use('/oauth', oauthRoutes);
// Protected routes (authenticated users)
v1Router.use('/members', memberRoutes);
v1Router.use('/branches', branchRoutes);
v1Router.use('/trainers', trainerRoutes);
v1Router.use('/membership-plans', membershipRoutes);
v1Router.use('/classes', classRoutes);
v1Router.use('/products', productRoutes);
v1Router.use('/orders', orderRoutes);
v1Router.use('/attendance', attendanceRoutes);
v1Router.use('/transactions', transactionRoutes);
v1Router.use('/lockers', lockerRoutes);
v1Router.use('/equipment', equipmentRoutes);
v1Router.use('/plans', dietWorkoutRoutes);
v1Router.use('/feedback', feedbackRoutes);
v1Router.use('/announcements', announcementRoutes);
v1Router.use('/referrals', referralRoutes);

// MFA routes (protected)
v1Router.use('/mfa', mfaRoutes);

// AI Plan Generator
v1Router.use('/ai-plans', aiPlanGeneratorRoutes);

// Phase 6-8: User, Role, Payment, Subscription Management
v1Router.use('/users', userRoutes);
v1Router.use('/roles', ipWhitelist, roleRoutes); // IP whitelist for role management
v1Router.use('/payments', paymentRoutes);
v1Router.use('/subscriptions', subscriptionRoutes);
v1Router.use('/invoices', invoiceRoutes);

// Phase 9-10: Trainer Advanced & Multi-Tenancy
v1Router.use('/assignments', assignmentRoutes);
v1Router.use('/packages', packageRoutes);
v1Router.use('/trainer-changes', trainerChangeRoutes);
v1Router.use('/trainer-reviews', trainerReviewRoutes);
v1Router.use('/gyms', gymRoutes);
v1Router.use('/enrollments', enrollmentRoutes);
v1Router.use('/leads', leadRoutes);

// Phase 11-12: Member Progress & Task Management
v1Router.use('/progress', memberProgressRoutes);
v1Router.use('/tasks', taskRoutes);

// Phase 1 Migration: Member Credits & Membership Freeze
v1Router.use('/member-credits', memberCreditsRoutes);
v1Router.use('/membership-freeze', membershipFreezeRoutes);
v1Router.use('/member-goals', memberGoalsRoutes);
v1Router.use('/analytics', analyticsEventsRoutes);
v1Router.use('/team', teamRoutes);
v1Router.use('/templates', templatesRoutes);

// Admin routes with IP whitelisting
v1Router.use('/user-management', adminIpWhitelist, userManagementRoutes);

// Mount v1 router
app.use('/api/v1', v1Router);

// Legacy routes (redirect to v1 for backwards compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/users', userRoutes);

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
  console.log(`🚀 GymFlow Backend API running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`\n✅ Server ready at http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🔑 API v1: http://localhost:${PORT}/api/v1\n`);
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
