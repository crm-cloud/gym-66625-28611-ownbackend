import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useBranchContext } from './useBranchContext';
import { Locker, LockerSummary } from '@/types/locker';

export const useLockers = (branchId?: string) => {
  const { currentBranchId } = useBranchContext();
  const targetBranchId = branchId || currentBranchId;
  
  return useSupabaseQuery(
    ['lockers', targetBranchId],
    async () => {
      let query = supabase
        .from('lockers')
        .select(`
          *,
          branches!branch_id (
            name
          ),
          locker_sizes!size_id (
            name,
            dimensions,
            monthly_fee
          ),
          members!assigned_member_id (
            full_name
          )
        `)
        .order('number');

      if (targetBranchId) {
        query = query.eq('branch_id', targetBranchId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map((locker): Locker => ({
        id: locker.id,
        name: locker.name,
        number: locker.number,
        branchId: locker.branch_id,
        branchName: locker.branches?.name || '',
        size: {
          id: locker.size_id || '',
          name: locker.locker_sizes?.name || '',
          dimensions: locker.locker_sizes?.dimensions || '',
          monthlyFee: locker.locker_sizes?.monthly_fee || 0
        },
        status: locker.status,
        assignedMemberId: locker.assigned_member_id,
        assignedMemberName: locker.members?.full_name,
        assignedDate: locker.assigned_date,
        expirationDate: locker.expiration_date,
        releaseDate: locker.release_date,
        monthlyFee: locker.monthly_fee || 0,
        notes: locker.notes,
        createdAt: locker.created_at,
        updatedAt: locker.updated_at
      }));
    },
    {
      enabled: !!targetBranchId
    }
  );
};

export const useLockerSummary = (branchId?: string) => {
  const { currentBranchId } = useBranchContext();
  const targetBranchId = branchId || currentBranchId;
  
  return useSupabaseQuery(
    ['locker-summary', targetBranchId],
    async () => {
      let query = supabase.from('lockers').select('status, monthly_fee');
      
      if (targetBranchId) {
        query = query.eq('branch_id', targetBranchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const lockers = data || [];
      const totalLockers = lockers.length;
      const availableLockers = lockers.filter(l => l.status === 'available').length;
      const occupiedLockers = lockers.filter(l => l.status === 'occupied').length;
      const maintenanceLockers = lockers.filter(l => l.status === 'maintenance').length;
      const reservedLockers = lockers.filter(l => l.status === 'reserved').length;
      const occupancyRate = totalLockers > 0 ? (occupiedLockers / totalLockers) * 100 : 0;
      const monthlyRevenue = lockers
        .filter(l => l.status === 'occupied')
        .reduce((sum, l) => sum + (l.monthly_fee || 0), 0);

      return {
        totalLockers,
        availableLockers,
        occupiedLockers,
        maintenanceLockers,
        reservedLockers,
        occupancyRate,
        monthlyRevenue
      } as LockerSummary;
    },
    {
      enabled: !!targetBranchId
    }
  );
};

export const useCreateLocker = () => {
  return useSupabaseMutation(
    async (lockerData: any) => {
      const { data, error } = await supabase
        .from('lockers')
        .insert(lockerData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['lockers'], ['locker-summary']]
    }
  );
};

export const useBulkCreateLockers = () => {
  return useSupabaseMutation(
    async ({ count, branchId, sizeId, startNumber = 1, prefix = '' }: {
      count: number;
      branchId: string;
      sizeId: string;
      startNumber?: number;
      prefix?: string;
    }) => {
      const lockers = Array.from({ length: count }, (_, index) => ({
        name: `${prefix}${startNumber + index}`,
        number: `${prefix}${startNumber + index}`,
        branch_id: branchId,
        size_id: sizeId,
        status: 'available' as const,
        monthly_fee: 0
      }));

      const { data, error } = await supabase
        .from('lockers')
        .insert(lockers)
        .select();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['lockers'], ['locker-summary']]
    }
  );
};

export const useUpdateLocker = () => {
  return useSupabaseMutation(
    async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('lockers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['lockers'], ['locker-summary']]
    }
  );
};

export const useDeleteLocker = () => {
  return useSupabaseMutation(
    async (id: string) => {
      const { error } = await supabase
        .from('lockers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    {
      invalidateQueries: [['lockers'], ['locker-summary']]
    }
  );
};

export const useAssignLocker = () => {
  return useSupabaseMutation(
    async ({ 
      lockerId, 
      memberId, 
      monthlyFee, 
      expirationDate, 
      notes,
      createInvoice = false 
    }: {
      lockerId: string;
      memberId: string;
      monthlyFee: number;
      expirationDate?: string;
      notes?: string;
      createInvoice?: boolean;
    }) => {
      const updateData = {
        status: 'occupied' as const,
        assigned_member_id: memberId,
        assigned_date: new Date().toISOString().split('T')[0],
        expiration_date: expirationDate,
        notes,
        monthly_fee: monthlyFee
      };

      const { data: lockerData, error: lockerError } = await supabase
        .from('lockers')
        .update(updateData)
        .eq('id', lockerId)
        .select()
        .single();

      if (lockerError) throw lockerError;

      // Create invoice if locker has charges
      if (createInvoice && monthlyFee > 0) {
        const { data: memberData } = await supabase
          .from('members')
          .select('full_name, email')
          .eq('id', memberId)
          .single();

        const invoiceNumber = `INV-${Date.now()}`;
        
        const { error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            invoice_number: invoiceNumber,
            customer_id: memberId,
            customer_name: memberData?.full_name || 'Unknown',
            customer_email: memberData?.email || '',
            date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            subtotal: monthlyFee,
            total: monthlyFee,
            status: 'draft',
            notes: `Locker ${lockerData.number} - Monthly Fee`
          });

        if (invoiceError) throw invoiceError;
      }

      return lockerData;
    },
    {
      invalidateQueries: [['lockers'], ['locker-summary']]
    }
  );
};

export const useReleaseLocker = () => {
  return useSupabaseMutation(
    async (lockerId: string) => {
      const { data, error } = await supabase
        .from('lockers')
        .update({
          status: 'available' as const,
          assigned_member_id: null,
          assigned_date: null,
          expiration_date: null,
          release_date: new Date().toISOString().split('T')[0],
          notes: null
        })
        .eq('id', lockerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['lockers'], ['locker-summary']]
    }
  );
};