import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication and admin/manager roles
router.use(authenticate);
router.use(authorize({ roles: ['super_admin', 'admin', 'manager'] }));

// Transactions
router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransaction);
router.post('/', transactionController.createTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', authorize({ roles: ['super_admin', 'admin'] }), transactionController.deleteTransaction);

// Categories
router.get('/categories/list', transactionController.getCategories);
router.post('/categories', authorize({ roles: ['super_admin', 'admin'] }), transactionController.createCategory);
router.put('/categories/:id', authorize({ roles: ['super_admin', 'admin'] }), transactionController.updateCategory);

export default router;
