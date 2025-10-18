import { useState, useEffect } from 'react';
import { useSupabaseQuery } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const SELECTED_BRANCH_KEY = 'selected_branch_id';

export const useBranches = () => {
  const [selectedBranch, setSelectedBranchState] = useState<any>(null);
  const queryClient = useQueryClient();
  
  // Initialize selected branch from localStorage on mount
  useEffect(() => {
    const savedBranchId = localStorage.getItem(SELECTED_BRANCH_KEY);
    if (savedBranchId) {
      // Try to find the branch in the cache first
      const cachedBranches = queryClient.getQueryData(['branches']) as any[];
      if (cachedBranches && Array.isArray(cachedBranches)) {
        const branch = cachedBranches.find((b: any) => b.id === savedBranchId);
        if (branch) {
          setSelectedBranchState(branch);
        } else {
          localStorage.removeItem(SELECTED_BRANCH_KEY);
        }
      }
    }
  }, [queryClient]);
  
  const setSelectedBranch = (branch: any) => {
    if (branch) {
      localStorage.setItem(SELECTED_BRANCH_KEY, branch.id);
    } else {
      localStorage.removeItem(SELECTED_BRANCH_KEY);
    }
    setSelectedBranchState(branch);
  };
  
  const queryResult = useSupabaseQuery(
    ['branches'],
    async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      
      // If no branch is selected, select the first one by default
      if (data && data.length > 0 && !selectedBranch) {
        const savedBranchId = localStorage.getItem(SELECTED_BRANCH_KEY);
        const branchToSelect = savedBranchId 
          ? data.find(b => b.id === savedBranchId) || data[0]
          : data[0];
        
        if (branchToSelect) {
          setSelectedBranch(branchToSelect);
        }
      }
      
      return data || [];
    }
  );

  return {
    ...queryResult,
    branches: queryResult.data || [],
    selectedBranch: selectedBranch || (queryResult.data?.[0] || null),
    setSelectedBranch
  };
};