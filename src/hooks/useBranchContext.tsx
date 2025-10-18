import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { useBranches } from './useBranches';

interface BranchContextType {
  selectedBranchId: string | null;
  currentBranchId: string | null; // Alias for backward compatibility
  setSelectedBranchId: (branchId: string | null) => void;
  setCurrentBranchId: (branchId: string | null) => void; // Alias for backward compatibility
  branches: any[];
  isLoading: boolean;
  canAccessBranch: (branchId: string) => boolean;
  getAccessibleBranches: () => string[];
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranchContext = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranchContext must be used within BranchProvider');
  }
  return context;
};

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const { authState } = useAuth();
  const { data: branches = [], isLoading } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  useEffect(() => {
    // Set default branch based on user's assigned branch or first available
    if (!selectedBranchId && branches.length > 0) {
      const userBranchId = authState.user?.branchId;
      
      if (userBranchId) {
        // User has assigned branch
        setSelectedBranchId(userBranchId);
      } else if (authState.user?.role === 'admin' || authState.user?.role === 'super-admin') {
        // Admins can access all branches - set to first branch or null for "all"
        setSelectedBranchId(null); // null means "all branches"
      } else if (branches.length > 0) {
        // Default to first branch
        setSelectedBranchId(branches[0].id);
      }
    }
  }, [branches, authState.user, selectedBranchId]);

  const canAccessBranch = (branchId: string): boolean => {
    if (!authState.user) return false;
    if (authState.user.role === 'super-admin' || authState.user.role === 'admin') return true;
    return branches.some(branch => branch.id === branchId);
  };

  const getAccessibleBranches = (): string[] => {
    if (!authState.user) return [];
    if (authState.user.role === 'super-admin') return ['all'];
    return branches.map(branch => branch.id);
  };

  return (
    <BranchContext.Provider
      value={{
        selectedBranchId,
        currentBranchId: selectedBranchId, // Alias for backward compatibility
        setSelectedBranchId,
        setCurrentBranchId: setSelectedBranchId, // Alias for backward compatibility
        branches,
        isLoading,
        canAccessBranch,
        getAccessibleBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

// Export both names for backward compatibility
export const BranchContextProvider = BranchProvider;
