import { createContext, useContext, ReactNode } from 'react';
import { useBranches } from '@/hooks/useSupabaseQuery';

interface BranchContextType {
  currentBranchId: string | null;
  selectedBranch: any;
  branches: any[];
  setSelectedBranch: (branch: any) => void;
  isLoading: boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const { branches, selectedBranch, setSelectedBranch, isLoading } = useBranches();
  
  return (
    <BranchContext.Provider
      value={{
        currentBranchId: selectedBranch?.id || null,
        selectedBranch,
        branches,
        setSelectedBranch,
        isLoading
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranchContext = () => {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranchContext must be used within a BranchProvider');
  }
  return context;
};
