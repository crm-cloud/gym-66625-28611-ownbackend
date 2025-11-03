import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { invoiceController } from '../controllers/invoice.controller';

const router = Router();

router.use(authenticate);

// Get invoices
router.get('/', authorize(['admin', 'manager']), invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoiceById);

// Download invoices
router.get('/:id/download-pdf', invoiceController.downloadPDF);
router.get('/:id/download-gst', invoiceController.downloadGST);
router.get('/:id/download-non-gst', invoiceController.downloadNonGST);

// Send invoice via email
router.post('/:id/send-email', invoiceController.sendInvoiceEmail);

// Create/Update invoices
router.post('/', authorize(['admin', 'manager']), invoiceController.createInvoice);
router.put('/:id', authorize(['admin', 'manager']), invoiceController.updateInvoice);

export default router;
