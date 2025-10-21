import { api } from '@/lib/axios';

export interface RevenueByAdminReport {
  adminId: string;
  adminName: string;
  adminEmail: string;
  totalRevenue: number;
  gstRevenue: number;
  nonGstRevenue: number;
  gymCount: number;
  branchCount: number;
  memberCount: number;
}

export interface RevenueByBranchReport {
  branchId: string;
  branchName: string;
  gymName: string;
  adminName: string;
  totalRevenue: number;
  gstRevenue: number;
  nonGstRevenue: number;
  invoiceCount: number;
  memberCount: number;
}

export interface PendingInvoicesReport {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  branchName: string;
  adminName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue';
  daysPastDue: number;
}

export interface MembershipSummaryReport {
  branchId: string;
  branchName: string;
  gymName: string;
  adminName: string;
  activeMemberships: number;
  expiredMemberships: number;
  frozenMemberships: number;
  totalMembers: number;
  activeRate: number;
}

export interface LeadConversionReport {
  period: string;
  adminId?: string;
  adminName?: string;
  branchId?: string;
  branchName?: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageConversionTime: number; // days
  topSource: string;
}

/**
 * Report Service
 * Handles all platform reporting and analytics
 */
class ReportServiceClass {
  /**
   * Get revenue by admin
   */
  async getRevenueByAdmin(dateFrom?: string, dateTo?: string): Promise<RevenueByAdminReport[]> {
    const { data } = await api.get('/api/reports/revenue-by-admin', {
      params: { date_from: dateFrom, date_to: dateTo }
    });
    return data || [];
  }

  /**
   * Get revenue by branch
   */
  async getRevenueByBranch(dateFrom?: string, dateTo?: string): Promise<RevenueByBranchReport[]> {
    const { data } = await api.get('/api/reports/revenue-by-branch', {
      params: { date_from: dateFrom, date_to: dateTo }
    });
    return data || [];
  }

  /**
   * Get pending invoices
   */
  async getPendingInvoices(): Promise<PendingInvoicesReport[]> {
    const { data } = await api.get('/api/reports/pending-invoices');
    return data || [];
  }

  /**
   * Get membership summary
   */
  async getMembershipSummary(): Promise<MembershipSummaryReport[]> {
    const { data } = await api.get('/api/reports/membership-summary');
    return data || [];
  }

  /**
   * Get lead conversion report
   */
  async getLeadConversionReport(period: 'monthly' | 'quarterly' = 'monthly'): Promise<LeadConversionReport[]> {
    const { data } = await api.get('/api/reports/lead-conversion', {
      params: { period }
    });
    return data || [];
  }

  /**
   * Export report to PDF
   */
  async exportToPDF(reportType: string, params?: Record<string, any>): Promise<Blob> {
    const { data } = await api.get(`/api/reports/${reportType}/pdf`, {
      params,
      responseType: 'blob'
    });
    return data;
  }

  /**
   * Export report to Excel
   */
  async exportToExcel(reportType: string, params?: Record<string, any>): Promise<Blob> {
    const { data } = await api.get(`/api/reports/${reportType}/excel`, {
      params,
      responseType: 'blob'
    });
    return data;
  }

  /**
   * Export report to CSV
   */
  async exportToCSV(reportData: any[], reportType: string): Promise<void> {
    const csvContent = this.convertToCSV(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Convert array data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  }
}

export const ReportService = new ReportServiceClass();
