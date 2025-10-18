import { useSupabaseQuery } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export const useSystemMetrics = () => {
  const { data: systemHealth, isLoading: healthLoading } = useSupabaseQuery(
    ['system-health'],
    async () => {
      // Mock system health check - in real app would check actual system status
      return {
        uptime: 99.9,
        status: 'operational',
        lastCheck: new Date().toISOString()
      };
    }
  );

  const { data: branchMetrics, isLoading: branchLoading } = useSupabaseQuery(
    ['branch-metrics'],
    async () => {
      const { data: branches, error } = await supabase
        .from('branches')
        .select('*');
      
      if (error) throw error;
      
      return {
        total: branches?.length || 0,
        active: branches?.filter(b => b.status === 'active').length || 0,
        newThisQuarter: 3 // This would be calculated from creation dates
      };
    }
  );

  const { data: userMetrics, isLoading: userLoading } = useSupabaseQuery(
    ['user-metrics'],
    async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      
      return {
        total: profiles?.length || 0,
        active: profiles?.filter(p => p.is_active).length || 0
      };
    }
  );

  const { data: revenueMetrics, isLoading: revenueLoading } = useSupabaseQuery(
    ['revenue-metrics'],
    async () => {
      const { data: memberships, error } = await supabase
        .from('member_memberships')
        .select('payment_amount')
        .eq('status', 'active');
      
      if (error) throw error;
      
      const totalRevenue = memberships?.reduce((sum, m) => sum + (m.payment_amount || 0), 0) || 0;
      
      return {
        total: totalRevenue,
        growth: 15, // This would be calculated from historical data
        currency: 'USD'
      };
    }
  );

  return {
    systemHealth,
    branchMetrics,
    userMetrics,
    revenueMetrics,
    isLoading: healthLoading || branchLoading || userLoading || revenueLoading
  };
};