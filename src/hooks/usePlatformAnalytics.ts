import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PlatformKPIs {
  totalGyms: number;
  totalBranches: number;
  totalAdmins: number;
  totalMembers: number;
  totalTrainers: number;
  totalStaff: number;
  activeMemberships: number;
  expiredMemberships: number;
  membershipActivePercent: number;
  totalRevenue: number;
  gstRevenue: number;
  nonGstRevenue: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

interface AdminSummary {
  id: string;
  name: string;
  email: string;
  gymCount: number;
  branchCount: number;
  memberCount: number;
  trainerCount: number;
  totalRevenue: number;
  activeMemberships: number;
  expiredMemberships: number;
}

interface BranchSummary {
  id: string;
  name: string;
  gymName: string;
  adminName: string;
  memberCount: number;
  trainerCount: number;
  staffCount: number;
  revenue: number;
  leads: number;
  convertedLeads: number;
}

export const usePlatformAnalytics = () => {
  // Fetch platform KPIs
  const { data: platformKPIs, isLoading: kpisLoading } = useQuery({
    queryKey: ['platform-kpis'],
    queryFn: async (): Promise<PlatformKPIs> => {
      // Get gyms count
      const { data: gyms } = await supabase
        .from('gyms')
        .select('*');

      // Get branches count
      const { data: branches } = await supabase
        .from('branches')
        .select('*')
        .eq('status', 'active');

      // Get user counts by role
      const { data: profiles } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('is_active', true);

      // Get membership stats
      const { data: memberships } = await supabase
        .from('member_memberships')
        .select('status, payment_amount');

      // Get leads stats
      const { data: leads } = await supabase
        .from('leads')
        .select('status');

      // Calculate KPIs
      const totalGyms = gyms?.length || 0;
      const totalBranches = branches?.length || 0;
      
      const adminCount = profiles?.filter(p => ['admin'].includes(p.role)).length || 0;
      const memberCount = profiles?.filter(p => p.role === 'member').length || 0;
      const trainerCount = profiles?.filter(p => p.role === 'trainer').length || 0;
      const staffCount = profiles?.filter(p => ['staff', 'manager'].includes(p.role)).length || 0;

      const activeMemberships = memberships?.filter(m => m.status === 'active').length || 0;
      const expiredMemberships = memberships?.filter(m => m.status === 'expired').length || 0;
      const totalMemberships = activeMemberships + expiredMemberships;
      const membershipActivePercent = totalMemberships > 0 ? (activeMemberships / totalMemberships) * 100 : 0;

      const totalRevenue = memberships?.reduce((sum, m) => sum + (m.payment_amount || 0), 0) || 0;
      // Assume 18% GST for calculation - can be made configurable
      const gstRevenue = totalRevenue * 0.18;
      const nonGstRevenue = totalRevenue - gstRevenue;

      const totalLeads = leads?.length || 0;
      const convertedLeads = leads?.filter(l => l.status === 'converted').length || 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      return {
        totalGyms,
        totalBranches,
        totalAdmins: adminCount,
        totalMembers: memberCount,
        totalTrainers: trainerCount,
        totalStaff: staffCount,
        activeMemberships,
        expiredMemberships,
        membershipActivePercent,
        totalRevenue,
        gstRevenue,
        nonGstRevenue,
        totalLeads,
        convertedLeads,
        conversionRate
      };
    }
  });

  // Fetch admin summaries
  const { data: adminSummaries, isLoading: adminsLoading } = useQuery({
    queryKey: ['admin-summaries'],
    queryFn: async (): Promise<AdminSummary[]> => {
      const { data: admins } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, gym_id')
        .eq('role', 'admin')
        .eq('is_active', true);

      if (!admins) return [];

      const summaries = await Promise.all(
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

          // Get members and trainers in this gym
          const { data: gymProfiles } = await supabase
            .from('profiles')
            .select('role, user_id')
            .eq('gym_id', admin.gym_id)
            .eq('is_active', true);

          // Get memberships for this gym
          const { data: memberships } = await supabase
            .from('member_memberships')
            .select('status, payment_amount, user_id')
            .eq('status', 'active');

          // Filter memberships for users in this gym
          const gymUserIds = gymProfiles?.filter(p => p.role === 'member').map(p => p.user_id) || [];
          const gymMemberships = memberships?.filter(m => gymUserIds.includes(m.user_id)) || [];

          const memberCount = gymProfiles?.filter(p => p.role === 'member').length || 0;
          const trainerCount = gymProfiles?.filter(p => p.role === 'trainer').length || 0;
          const totalRevenue = gymMemberships?.reduce((sum, m) => sum + (m.payment_amount || 0), 0) || 0;
          const activeMemberships = gymMemberships?.filter(m => m.status === 'active').length || 0;

          return {
            id: admin.user_id,
            name: admin.full_name || 'Unknown',
            email: admin.email || '',
            gymCount: gyms?.length || 0,
            branchCount: branches?.length || 0,
            memberCount,
            trainerCount,
            totalRevenue,
            activeMemberships,
            expiredMemberships: memberCount - activeMemberships
          };
        })
      );

      return summaries;
    }
  });

  // Fetch branch summaries
  const { data: branchSummaries, isLoading: branchesLoading } = useQuery({
    queryKey: ['branch-summaries'],
    queryFn: async (): Promise<BranchSummary[]> => {
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

      const summaries = await Promise.all(
        branches.map(async (branch) => {
          // Get admin info
          const { data: admin } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', branch.gyms?.created_by)
            .single();

          // Get member/trainer/staff counts for this branch
          const { data: profiles } = await supabase
            .from('profiles')
            .select('role, user_id')
            .eq('gym_id', branch.gym_id)
            .eq('is_active', true);

          // Get leads for this branch (if leads table has branch_id)
          const { data: leads } = await supabase
            .from('leads')
            .select('status');

          const memberCount = profiles?.filter(p => p.role === 'member').length || 0;
          const trainerCount = profiles?.filter(p => p.role === 'trainer').length || 0;
          const staffCount = profiles?.filter(p => ['staff', 'manager'].includes(p.role)).length || 0;

          const totalLeads = leads?.length || 0;
          const convertedLeads = leads?.filter(l => l.status === 'converted').length || 0;

          return {
            id: branch.id,
            name: branch.name,
            gymName: branch.gyms?.name || 'Unknown Gym',
            adminName: admin?.full_name || 'Unknown Admin',
            memberCount,
            trainerCount,
            staffCount,
            revenue: 0, // Would need to calculate from memberships
            leads: totalLeads,
            convertedLeads
          };
        })
      );

      return summaries;
    }
  });

  return {
    platformKPIs,
    adminSummaries,
    branchSummaries,
    isLoading: kpisLoading || adminsLoading || branchesLoading
  };
};