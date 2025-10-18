import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/', authorize({ roles: ['super_admin', 'admin', 'manager'] }), productController.createProduct);
router.put('/:id', authorize({ roles: ['super_admin', 'admin', 'manager'] }), productController.updateProduct);
router.delete('/:id', authorize({ roles: ['super_admin', 'admin'] }), productController.deleteProduct);

export default router;
