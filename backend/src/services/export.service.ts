import { prisma } from '../lib/prisma';
import { Parser } from 'json2csv';

/**
 * Export Service
 * Handles data export operations (CSV, Excel, PDF)
 */

export interface ExportOptions {
  format: 'csv' | 'json';
  fields?: string[];
  filters?: any;
}

class ExportService {
  /**
   * Export members
   */
  async exportMembers(options: ExportOptions = { format: 'csv' }) {
    const members = await prisma.member.findMany({
      where: options.filters || {},
      include: {
        user: {
          select: {
            email: true,
            full_name: true,
            phone: true,
          },
        },
        membership_plan: {
          select: {
            name: true,
          },
        },
      },
    });

    const data = members.map(m => ({
      id: m.member_id,
      name: m.user.full_name,
      email: m.user.email,
      phone: m.user.phone,
      membership: m.membership_plan?.name || 'N/A',
      join_date: m.join_date,
      status: m.status,
    }));

    return this.formatExport(data, options);
  }

  /**
   * Export payments
   */
  async exportPayments(options: ExportOptions = { format: 'csv' }) {
    const payments = await prisma.payment.findMany({
      where: options.filters || {},
      include: {
        member: {
          include: {
            user: {
              select: {
                full_name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const data = payments.map(p => ({
      id: p.payment_id,
      member: p.member.user.full_name,
      email: p.member.user.email,
      amount: p.amount,
      status: p.status,
      payment_method: p.payment_method,
      payment_date: p.payment_date,
      due_date: p.due_date,
    }));

    return this.formatExport(data, options);
  }

  /**
   * Export attendance
   */
  async exportAttendance(options: ExportOptions = { format: 'csv' }) {
    const attendance = await prisma.attendance.findMany({
      where: options.filters || {},
      include: {
        member: {
          include: {
            user: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
    });

    const data = attendance.map(a => ({
      id: a.attendance_id,
      member: a.member.user.full_name,
      check_in: a.check_in_time,
      check_out: a.check_out_time,
      date: a.date,
    }));

    return this.formatExport(data, options);
  }

  /**
   * Export classes
   */
  async exportClasses(options: ExportOptions = { format: 'csv' }) {
    const classes = await prisma.class.findMany({
      where: options.filters || {},
      include: {
        trainer: {
          include: {
            user: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
    });

    const data = classes.map(c => ({
      id: c.class_id,
      name: c.name,
      trainer: c.trainer.user.full_name,
      capacity: c.capacity,
      duration: c.duration_minutes,
      start_time: c.start_time,
      end_time: c.end_time,
    }));

    return this.formatExport(data, options);
  }

  /**
   * Export revenue report
   */
  async exportRevenueReport(startDate: Date, endDate: Date, options: ExportOptions = { format: 'csv' }) {
    const payments = await prisma.payment.findMany({
      where: {
        payment_date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'completed',
      },
      include: {
        member: {
          include: {
            user: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
    });

    const data = payments.map(p => ({
      date: p.payment_date,
      member: p.member.user.full_name,
      amount: p.amount,
      payment_method: p.payment_method,
      description: p.description,
    }));

    // Add summary
    const summary = {
      total_revenue: payments.reduce((sum, p) => sum + Number(p.amount), 0),
      total_transactions: payments.length,
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    };

    return {
      data: this.formatExport(data, options),
      summary,
    };
  }

  /**
   * Format export data
   */
  private formatExport(data: any[], options: ExportOptions) {
    if (options.format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // CSV format
    try {
      const fields = options.fields || Object.keys(data[0] || {});
      const parser = new Parser({ fields });
      return parser.parse(data);
    } catch (error) {
      throw new Error('Failed to generate CSV');
    }
  }

  /**
   * Get export filename
   */
  getFilename(type: string, format: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${type}_export_${timestamp}.${format}`;
  }
}

export const exportService = new ExportService();
