import { Request, Response, NextFunction } from 'express';
import { invoiceService } from '../services/invoice.service';

export class InvoiceController {
  /**
   * Get all invoices
   */
  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        from_date: req.query.from_date as string,
        to_date: req.query.to_date as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50
      };

      const result = await invoiceService.getInvoices(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.getInvoiceById(id);
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download invoice PDF
   */
  async downloadPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pdfBuffer = await invoiceService.generateInvoicePDF(id, 'standard');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download GST invoice
   */
  async downloadGST(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pdfBuffer = await invoiceService.generateInvoicePDF(id, 'gst');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-gst-${id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download non-GST invoice
   */
  async downloadNonGST(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pdfBuffer = await invoiceService.generateInvoicePDF(id, 'non-gst');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-non-gst-${id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send invoice via email
   */
  async sendInvoiceEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { email, format } = req.body;
      
      await invoiceService.sendInvoiceEmail(id, email, format || 'standard');
      
      res.json({
        success: true,
        message: 'Invoice sent successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create invoice
   */
  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.createInvoice(req.body, req.user!.userId);
      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.updateInvoice(id, req.body);
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }
}

export const invoiceController = new InvoiceController();
