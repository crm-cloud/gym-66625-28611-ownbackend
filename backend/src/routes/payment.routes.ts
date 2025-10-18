import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// Webhook (no authentication required)
router.post('/webhook/:gateway', paymentController.handleWebhook);

// All other routes require authentication
router.use(authenticate);

// Gateway configuration (admin only)
router.get('/gateways', authorize(['admin', 'super_admin']), paymentController.getGatewayConfigs);
router.put('/gateways/:id', authorize(['admin', 'super_admin']), paymentController.updateGatewayConfig);

// Payment operations
router.post('/orders', paymentController.createPaymentOrder);
router.post('/verify', paymentController.verifyPayment);
router.post('/links', authorize(['admin', 'manager', 'staff']), paymentController.createPaymentLink);
router.post('/refunds', authorize(['admin', 'super_admin']), paymentController.processRefund);

// Payment queries
router.get('/', authorize(['admin', 'super_admin', 'manager']), paymentController.getPayments);
router.get('/analytics', authorize(['admin', 'super_admin', 'manager']), paymentController.getPaymentAnalytics);

export default router;
