import { supabase } from '@/integrations/supabase/client';

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

export class PlatformReportService {
  static async getRevenueByAdmin(dateFrom?: string, dateTo?: string): Promise<RevenueByAdminReport[]> {
    try {
      // Get all admins
      const { data: admins } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, gym_id')
        .eq('role', 'admin')
        .eq('is_active', true);

      if (!admins) return [];

      const reports = await Promise.all(
        admins.map(async (admin) => {
          // Get gyms for this admin
          const { data: gyms } = await supabase
            .from('gyms')
            .select('*')
            .eq('id', admin.gym_id);

          // Get branches for this gym
          const { data: branches } = await supabase
            .from('branches')
            .select('*')
            .eq('gym_id', admin.gym_id)
            .eq('status', 'active');

          // Get members in this gym
          const { data: gymProfiles } = await supabase
            .from('profiles')
            .select('user_id, role')
            .eq('gym_id', admin.gym_id)
            .eq('role', 'member')
            .eq('is_active', true);

          // Get memberships for these members
          let membershipQuery = supabase
            .from('member_memberships')
            .select('payment_amount, created_at, user_id')
            .eq('status', 'active');

          if (dateFrom) membershipQuery = membershipQuery.gte('created_at', dateFrom);
          if (dateTo) membershipQuery = membershipQuery.lte('created_at', dateTo);

          const { data: memberships } = await membershipQuery;

          // Filter memberships for users in this gym
          const gymUserIds = gymProfiles?.map(p => p.user_id) || [];
          const gymMemberships = memberships?.filter(m => gymUserIds.includes(m.user_id)) || [];

          const totalRevenue = gymMemberships.reduce((sum, m) => sum + (m.payment_amount || 0), 0);
          const gstRevenue = totalRevenue * 0.18; // Assume 18% GST
          const nonGstRevenue = totalRevenue - gstRevenue;

          return {
            adminId: admin.user_id,
            adminName: admin.full_name || 'Unknown',
            adminEmail: admin.email || '',
            totalRevenue,
            gstRevenue,
            nonGstRevenue,
            gymCount: gyms?.length || 0,
            branchCount: branches?.length || 0,
            memberCount: gymProfiles?.length || 0
          };
        })
      );

      return reports.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } catch (error) {
      console.error('Error generating revenue by admin report:', error);
      return [];
    }
  }

  static async getRevenueByBranch(dateFrom?: string, dateTo?: string): Promise<RevenueByBranchReport[]> {
    try {
      const { data: branches } = await supabase
        .from('branches')
        .select(`
          *,
          gyms!gym_id (
            name,
            created_by
          )
        `)
        .eq('status', 'active');

      if (!branches) return [];

      const reports = await Promise.all(
        branches.map(async (branch) => {
          // Get admin info
          const { data: admin } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', branch.gyms?.created_by)
            .single();

          // Get members in this branch's gym
          const { data: members } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('gym_id', branch.gym_id)
            .eq('role', 'member')
            .eq('is_active', true);

          // Get invoices for this branch
          let invoiceQuery = supabase
            .from('invoices')
            .select('total, tax, created_at')
            .eq('branch_id', branch.id);

          if (dateFrom) invoiceQuery = invoiceQuery.gte('created_at', dateFrom);
          if (dateTo) invoiceQuery = invoiceQuery.lte('created_at', dateTo);

          const { data: invoices } = await invoiceQuery;

          const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.total, 0) || 0;
          const gstRevenue = invoices?.reduce((sum, inv) => sum + inv.tax, 0) || 0;
          const nonGstRevenue = totalRevenue - gstRevenue;

          return {
            branchId: branch.id,
            branchName: branch.name,
            gymName: branch.gyms?.name || 'Unknown Gym',
            adminName: admin?.full_name || 'Unknown Admin',
            totalRevenue,
            gstRevenue,
            nonGstRevenue,
            invoiceCount: invoices?.length || 0,
            memberCount: members?.length || 0
          };
        })
      );

      return reports.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } catch (error) {
      console.error('Error generating revenue by branch report:', error);
      return [];
    }
  }

  static async getPendingInvoices(): Promise<PendingInvoicesReport[]> {
    try {
      const { data: invoices } = await supabase
        .from('invoices')
        .select(`
          *,
          branches!branch_id (
            name,
            gyms!gym_id (
              name,
              created_by
            )
          )
        `)
        .in('status', ['draft', 'sent']);

      if (!invoices) return [];

      const reports = await Promise.all(
        invoices.map(async (invoice) => {
          // Get admin info
          const { data: admin } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', invoice.branches?.gyms?.created_by)
            .single();

          const dueDate = new Date(invoice.due_date);
          const today = new Date();
          const daysPastDue = Math.max(0, Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
          const status = daysPastDue > 0 ? 'overdue' : 'pending';

          return {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoice_number,
            customerName: invoice.customer_name,
            branchName: invoice.branches?.name || 'Unknown Branch',
            adminName: admin?.full_name || 'Unknown Admin',
            amount: invoice.total,
            dueDate: invoice.due_date,
            status: status as 'pending' | 'overdue',
            daysPastDue
          };
        })
      );

      return reports.sort((a, b) => b.daysPastDue - a.daysPastDue);
    } catch (error) {
      console.error('Error generating pending invoices report:', error);
      return [];
    }
  }

  static async getMembershipSummary(): Promise<MembershipSummaryReport[]> {
    try {
      const { data: branches } = await supabase
        .from('branches')
        .select(`
          *,
          gyms!gym_id (
            name,
            created_by
          )
        `)
        .eq('status', 'active');

      if (!branches) return [];

      const reports = await Promise.all(
        branches.map(async (branch) => {
          // Get admin info
          const { data: admin } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', branch.gyms?.created_by)
            .single();

          // Get all members in this gym
          const { data: members } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('gym_id', branch.gym_id)
            .eq('role', 'member')
            .eq('is_active', true);

          // Get membership statuses for these members
          const memberIds = members?.map(m => m.user_id) || [];
          const { data: memberships } = await supabase
            .from('member_memberships')
            .select('status, user_id')
            .in('user_id', memberIds);

          const activeMemberships = memberships?.filter(m => m.status === 'active').length || 0;
          const expiredMemberships = memberships?.filter(m => m.status === 'expired').length || 0;
          const frozenMemberships = memberships?.filter(m => m.status === 'frozen').length || 0;
          const totalMembers = members?.length || 0;
          const activeRate = totalMembers > 0 ? (activeMemberships / totalMembers) * 100 : 0;

          return {
            branchId: branch.id,
            branchName: branch.name,
            gymName: branch.gyms?.name || 'Unknown Gym',
            adminName: admin?.full_name || 'Unknown Admin',
            activeMemberships,
            expiredMemberships,
            frozenMemberships,
            totalMembers,
            activeRate
          };
        })
      );

      return reports.sort((a, b) => b.activeRate - a.activeRate);
    } catch (error) {
      console.error('Error generating membership summary report:', error);
      return [];
    }
  }

  static async getLeadConversionReport(period: 'monthly' | 'quarterly' = 'monthly'): Promise<LeadConversionReport[]> {
    try {
      const { data: leads } = await supabase
        .from('leads')
        .select(`
          *,
          created_at,
          conversion_date
        `);

      if (!leads) return [];

      // Group leads by time period and calculate conversion metrics
      const periodMap = new Map<string, {
        totalLeads: number;
        convertedLeads: number;
        conversionTimes: number[];
        sources: Map<string, number>;
      }>();

      leads.forEach(lead => {
        const date = new Date(lead.created_at);
        const periodKey = period === 'monthly' 
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          : `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`;

        if (!periodMap.has(periodKey)) {
          periodMap.set(periodKey, {
            totalLeads: 0,
            convertedLeads: 0,
            conversionTimes: [],
            sources: new Map()
          });
        }

        const periodData = periodMap.get(periodKey)!;
        periodData.totalLeads++;

        if (lead.status === 'converted' && lead.conversion_date) {
          periodData.convertedLeads++;
          const conversionTime = Math.ceil(
            (new Date(lead.conversion_date).getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          periodData.conversionTimes.push(conversionTime);
        }

        // Track lead sources
        const source = lead.source || 'unknown';
        periodData.sources.set(source, (periodData.sources.get(source) || 0) + 1);
      });

      const reports: LeadConversionReport[] = [];
      for (const [periodKey, data] of periodMap) {
        const conversionRate = data.totalLeads > 0 ? (data.convertedLeads / data.totalLeads) * 100 : 0;
        const averageConversionTime = data.conversionTimes.length > 0 
          ? data.conversionTimes.reduce((sum, time) => sum + time, 0) / data.conversionTimes.length 
          : 0;

        // Find top source
        let topSource = 'none';
        let maxCount = 0;
        for (const [source, count] of data.sources) {
          if (count > maxCount) {
            maxCount = count;
            topSource = source;
          }
        }

        reports.push({
          period: periodKey,
          totalLeads: data.totalLeads,
          convertedLeads: data.convertedLeads,
          conversionRate,
          averageConversionTime,
          topSource
        });
      }

      return reports.sort((a, b) => b.period.localeCompare(a.period));
    } catch (error) {
      console.error('Error generating lead conversion report:', error);
      return [];
    }
  }

  // Export functions
  static async exportToPDF(reportData: any, reportType: string): Promise<void> {
    // This would integrate with a PDF generation library
    console.log(`Exporting ${reportType} to PDF:`, reportData);
    // Implementation would use libraries like jsPDF or Puppeteer
  }

  static async exportToExcel(reportData: any, reportType: string): Promise<void> {
    // This would integrate with an Excel generation library
    console.log(`Exporting ${reportType} to Excel:`, reportData);
    // Implementation would use libraries like SheetJS or ExcelJS
  }

  static async exportToCSV(reportData: any, reportType: string): Promise<void> {
    // Simple CSV export implementation
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

  private static convertToCSV(data: any[]): string {
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