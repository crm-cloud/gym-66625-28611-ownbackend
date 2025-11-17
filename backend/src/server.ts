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
import { errorHandler as customErrorHandler } from './middleware/errorHandler';
import { errorHandler, formatResponse } from './middleware/responseFormatter';
import { logger } from './middleware/logger';
import { transformResponse, addPaginationHelper } from './middleware/transformer';
import { generalLimiter } from './middleware/rateLimiter';
import { ipWhitelist, adminIpWhitelist } from './middleware/ipWhitelist';
import { initializeStorage, UPLOAD_DIR } from './config/storage';
import { initializeEmailService } from './config/email';
import { swaggerDefinition } from './config/swagger';
import { toCamelCase } from './utils/caseConverter';

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
import adminManagementRoutes from './routes/admin-management.routes';
// Phase 13: API Architecture & Auth Enhancements
import mfaRoutes from './routes/mfa.routes';
import oauthRoutes from './routes/oauth.routes';
import aiPlanGeneratorRoutes from './routes/ai-plan-generator.routes';
import analyticsRoutes from './routes/analytics.routes';
import gymSubscriptionRoutes from './routes/gym-subscription.routes';
import profileRoutes from './routes/profile.routes';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (required for rate limiting behind reverse proxies)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🔍 [CORS] Origin:', origin);
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn('⚠️ [CORS] Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires'],
  exposedHeaders: ['Content-Range', 'X-Total-Count']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`🌐 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('📦 Headers:', JSON.stringify(req.headers, null, 2));
  if (req.method !== 'GET') {
    console.log('📝 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

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

// API routes - consolidated without v1 versioning
// Apply general rate limiter to all routes
app.use('/api/', generalLimiter);

// Public routes (no IP restrictions)
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);

// Protected routes (authenticated users)
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

// MFA routes (protected)
app.use('/api/mfa', mfaRoutes);

// AI Plan Generator
app.use('/api/ai-plans', aiPlanGeneratorRoutes);

// Phase 6-8: User, Role, Payment, Subscription Management
app.use('/api/users', userRoutes);
app.use('/api/roles', ipWhitelist, roleRoutes); // IP whitelist for role management
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

// NEW: Missing Backend Endpoints (All 6 Phases Implementation)
// Phase 1: Payment Webhooks & Discounts
import discountRoutes from './routes/discount.routes';
app.use('/api/discounts', discountRoutes);

// Phase 2: System Settings
import settingsRoutes from './routes/settings.routes';
app.use('/api/settings', settingsRoutes);

// Phase 4: File Upload
import fileRoutes from './routes/file.routes';
app.use('/api/files', fileRoutes);

// Phase 5: Platform Analytics & System Tools
import platformRoutes from './routes/platform.routes';
import systemRoutes from './routes/system.routes';
app.use('/api/platform', platformRoutes);
app.use('/api/system', systemRoutes);

// Phase 6: Template & Log Management
import maintenanceRoutes from './routes/maintenance.routes';
import logsRoutes from './routes/logs.routes';
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/member-goals', memberGoalsRoutes);
app.use('/api/analytics-events', analyticsEventsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/templates', templatesRoutes);

// Admin routes with IP whitelisting
app.use('/api/user-management', adminIpWhitelist, userManagementRoutes);
app.use('/api/admin-management', adminManagementRoutes);

// New Phase: Super Admin & Analytics
app.use('/api/gym-subscriptions', gymSubscriptionRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    path: req.path
  });
});

// Response formatting
app.use(formatResponse);

// Error handling
app.use(customErrorHandler);
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
  console.log(`🔑 API Base URL: http://localhost:${PORT}/api\n`);
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
