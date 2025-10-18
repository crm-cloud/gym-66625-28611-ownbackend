
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BranchContextType {
  currentBranchId: string | null;
  setCurrentBranchId: (branchId: string | null) => void;
  canAccessBranch: (branchId: string) => boolean;
  getAccessibleBranches: () => string[];
}

const BranchContext = createContext<BranchContextType | null>(null);

export const useBranchContext = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranchContext must be used within BranchContextProvider');
  }
  return context;
};

export const BranchContextProvider = ({ children }: { children: ReactNode }) => {
  const { authState } = useAuth();
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(() => {
    // Initialize from sessionStorage
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('selectedBranchId');
    }
    return null;
  });

  // Get user's accessible branches based on their gym
  const { data: branches = [] } = useQuery({
    queryKey: ['user-branches', authState.user?.gym_id],
    queryFn: async () => {
      if (!authState.user?.gym_id) return [];
      
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, status')
        .eq('gym_id', authState.user.gym_id)
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    },
    enabled: !!authState.user?.gym_id,
  });

  // Enhanced setCurrentBranchId with session persistence
  const handleSetCurrentBranchId = (branchId: string | null) => {
    setCurrentBranchId(branchId);
    if (typeof window !== 'undefined') {
      if (branchId) {
        sessionStorage.setItem('selectedBranchId', branchId);
      } else {
        sessionStorage.removeItem('selectedBranchId');
      }
    }
  };

  useEffect(() => {
    if (authState.user && branches.length > 0) {
      // Check if stored branch is still valid
      const storedBranchId = typeof window !== 'undefined' ? sessionStorage.getItem('selectedBranchId') : null;
      const isValidBranch = storedBranchId && branches.some(b => b.id === storedBranchId);
      
      if (isValidBranch) {
        setCurrentBranchId(storedBranchId);
      } else {
        // Set current branch based on user's primary branch or first available branch
        const branchId = authState.user.branchId || branches[0]?.id || null;
        handleSetCurrentBranchId(branchId);
      }
    } else {
      handleSetCurrentBranchId(null);
    }
  }, [authState.user, branches]);

  const canAccessBranch = (branchId: string): boolean => {
    if (!authState.user) return false;
    
    // Super Admin can access all branches across all gyms
    if (authState.user.role === 'super-admin') return true;
    
    // Gym Admin/Manager can access all branches within their gym
    if (['admin', 'manager'].includes(authState.user.role) && authState.user.gym_id) {
      return branches.some(branch => branch.id === branchId);
    }
    
    // Staff and trainers can only access their assigned branch or gym branches
    if (['staff', 'trainer'].includes(authState.user.role)) {
      return branches.some(branch => branch.id === branchId);
    }
    
    return false;
  };

  const getAccessibleBranches = (): string[] => {
    if (!authState.user) return [];
    
    // Super admins can access all branches (handled separately in components)
    if (authState.user.role === 'super-admin') return ['all'];
    
    // Return branch IDs that the user can access within their gym
    return branches.map(branch => branch.id);
  };

  return (
    <BranchContext.Provider value={{
      currentBranchId,
      setCurrentBranchId: handleSetCurrentBranchId,
      canAccessBranch,
      getAccessibleBranches
    }}>
      {children}
    </BranchContext.Provider>
  );
};
