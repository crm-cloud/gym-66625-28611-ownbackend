import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import PDFDocument from 'pdfkit';

export class InvoiceService {
  /**
   * Get invoices with filters
   */
  async getInvoices(filters: any) {
    const { status, from_date, to_date, page = 1, limit = 50 } = filters;
    
    let whereConditions: string[] = [];
    if (status) whereConditions.push(`status = '${status}'`);
    if (from_date) whereConditions.push(`invoice_date >= '${from_date}'`);
    if (to_date) whereConditions.push(`invoice_date <= '${to_date}'`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [invoices, totalResult] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT * FROM invoices
        ${whereClause}
        ORDER BY invoice_date DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
      prisma.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*)::int as total FROM invoices ${whereClause}
      `)
    ]);

    return {
      data: invoices,
      pagination: {
        page,
        limit,
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    };
  }

  /**
   * Get invoice by ID with full details
   */
  async getInvoiceById(invoiceId: string) {
    const invoice = await prisma.$queryRaw<any[]>`
      SELECT 
        i.*,
        m.full_name as member_name,
        m.email as member_email,
        m.phone as member_phone,
        g.name as gym_name,
        g.address as gym_address,
        g.phone as gym_phone,
        g.email as gym_email,
        g.gstin as gym_gstin
      FROM invoices i
      LEFT JOIN members m ON i.member_id = m.id
      LEFT JOIN gyms g ON i.gym_id = g.id
      WHERE i.invoice_number = ${invoiceId} OR i.id = ${invoiceId}
      LIMIT 1
    `;

    if (!invoice || invoice.length === 0) {
      throw new ApiError('Invoice not found', 404);
    }

    // Get invoice items
    const items = await prisma.$queryRaw<any[]>`
      SELECT * FROM invoice_items
      WHERE invoice_id = ${invoice[0].id}
      ORDER BY item_order
    `;

    return {
      ...invoice[0],
      items
    };
  }

  /**
   * Generate invoice PDF
   */
  async generateInvoicePDF(invoiceId: string, format: 'standard' | 'gst' | 'non-gst' = 'standard'): Promise<Buffer> {
    const invoice = await this.getInvoiceById(invoiceId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text(invoice.gym_name || 'Gym Name', { align: 'center' });
      doc.fontSize(10).text(invoice.gym_address || '', { align: 'center' });
      doc.text(`Phone: ${invoice.gym_phone || ''} | Email: ${invoice.gym_email || ''}`, { align: 'center' });
      
      if (format === 'gst' && invoice.gym_gstin) {
        doc.text(`GSTIN: ${invoice.gym_gstin}`, { align: 'center' });
      }

      doc.moveDown(2);

      // Invoice title
      doc.fontSize(16).text(format === 'gst' ? 'TAX INVOICE' : 'INVOICE', { align: 'center', underline: true });
      doc.moveDown();

      // Invoice details
      doc.fontSize(10);
      doc.text(`Invoice Number: ${invoice.invoice_number}`, 50, 180);
      doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, 350, 180);
      
      if (invoice.due_date) {
        doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 350, 195);
      }

      doc.moveDown(2);

      // Customer details
      doc.fontSize(12).text('Bill To:', { underline: true });
      doc.fontSize(10);
      doc.text(invoice.member_name || 'Customer Name');
      if (invoice.member_email) doc.text(`Email: ${invoice.member_email}`);
      if (invoice.member_phone) doc.text(`Phone: ${invoice.member_phone}`);

      doc.moveDown(2);

      // Items table
      const tableTop = doc.y;
      const itemCodeX = 50;
      const descriptionX = 120;
      const quantityX = 320;
      const priceX = 380;
      const amountX = 470;

      // Table header
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Item', itemCodeX, tableTop);
      doc.text('Description', descriptionX, tableTop);
      doc.text('Qty', quantityX, tableTop);
      doc.text('Price', priceX, tableTop);
      doc.text('Amount', amountX, tableTop);

      // Draw header line
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table rows
      doc.font('Helvetica');
      let yPosition = tableTop + 25;

      invoice.items.forEach((item: any, index: number) => {
        doc.text(item.item_code || `${index + 1}`, itemCodeX, yPosition);
        doc.text(item.description || item.item_name || '', descriptionX, yPosition, { width: 180 });
        doc.text(item.quantity?.toString() || '1', quantityX, yPosition);
        doc.text(`₹${item.unit_price?.toFixed(2) || '0.00'}`, priceX, yPosition);
        doc.text(`₹${item.total_price?.toFixed(2) || '0.00'}`, amountX, yPosition);
        yPosition += 25;
      });

      // Draw line before totals
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 10;

      // Totals
      doc.font('Helvetica-Bold');
      const totalsX = 380;

      doc.text('Subtotal:', totalsX, yPosition);
      doc.text(`₹${invoice.subtotal?.toFixed(2) || '0.00'}`, amountX, yPosition);
      yPosition += 20;

      if (invoice.discount_amount > 0) {
        doc.text('Discount:', totalsX, yPosition);
        doc.text(`- ₹${invoice.discount_amount?.toFixed(2)}`, amountX, yPosition);
        yPosition += 20;
      }

      if (format === 'gst' && invoice.tax_amount > 0) {
        const cgst = (invoice.tax_amount / 2).toFixed(2);
        const sgst = (invoice.tax_amount / 2).toFixed(2);
        
        doc.text('CGST (9%):', totalsX, yPosition);
        doc.text(`₹${cgst}`, amountX, yPosition);
        yPosition += 15;
        
        doc.text('SGST (9%):', totalsX, yPosition);
        doc.text(`₹${sgst}`, amountX, yPosition);
        yPosition += 20;
      } else if (invoice.tax_amount > 0) {
        doc.text('Tax:', totalsX, yPosition);
        doc.text(`₹${invoice.tax_amount?.toFixed(2)}`, amountX, yPosition);
        yPosition += 20;
      }

      doc.fontSize(12);
      doc.text('Total:', totalsX, yPosition);
      doc.text(`₹${invoice.total_amount?.toFixed(2) || '0.00'}`, amountX, yPosition);

      // Footer
      doc.fontSize(8).font('Helvetica');
      doc.text('Thank you for your business!', 50, 750, { align: 'center' });
      doc.text('This is a computer-generated invoice', { align: 'center' });

      doc.end();
    });
  }

  /**
   * Send invoice via email
   */
  async sendInvoiceEmail(invoiceId: string, email: string, format: 'standard' | 'gst' | 'non-gst' = 'standard') {
    const pdfBuffer = await this.generateInvoicePDF(invoiceId, format);
    
    // TODO: Implement email sending with attachment
    // For now, just return success
    return {
      success: true,
      message: 'Email sending will be implemented with email service integration'
    };
  }

  /**
   * Create invoice
   */
  async createInvoice(data: any, createdBy: string) {
    const invoiceNumber = `INV-${Date.now()}`;
    
    // Create invoice (simplified - in production, use proper transaction)
    const invoiceId = crypto.randomUUID();
    
    await prisma.$executeRaw`
      INSERT INTO invoices (
        id, invoice_number, member_id, gym_id, branch_id,
        invoice_date, due_date, subtotal, discount_amount,
        tax_amount, total_amount, status, created_by
      ) VALUES (
        ${invoiceId}, ${invoiceNumber}, ${data.member_id}, ${data.gym_id}, 
        ${data.branch_id || null}, ${data.invoice_date || new Date()}, 
        ${data.due_date || null}, ${data.subtotal}, ${data.discount_amount || 0},
        ${data.tax_amount || 0}, ${data.total_amount}, ${data.status || 'pending'},
        ${createdBy}
      )
    `;

    return { id: invoiceId, invoice_number: invoiceNumber };
  }

  /**
   * Update invoice
   */
  async updateInvoice(invoiceId: string, data: any) {
    await prisma.$executeRaw`
      UPDATE invoices
      SET 
        status = COALESCE(${data.status}, status),
        notes = COALESCE(${data.notes}, notes),
        updated_at = NOW()
      WHERE id = ${invoiceId} OR invoice_number = ${invoiceId}
    `;

    return { success: true, message: 'Invoice updated' };
  }
}

export const invoiceService = new InvoiceService();
