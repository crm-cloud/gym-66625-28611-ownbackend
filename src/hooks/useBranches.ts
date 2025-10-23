import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from '@/hooks/use-toast';

const SELECTED_BRANCH_KEY = 'selected_branch_id';

export const useBranches = (filters?: { search?: string; isActive?: boolean }) => {
  const [selectedBranch, setSelectedBranchState] = useState<any>(null);
  const queryClient = useQueryClient();
  
  // By default, the query is enabled
  // The parent component can control this with the 'enabled' option if needed
  const enabled = true;

  const queryResult = useQuery({
    queryKey: ['branches', filters?.search ?? '', filters?.isActive ?? 'all'],
    enabled, // Only enable the query if not on login page
    queryFn: async () => {
      const params: any = {};
      
      if (filters?.search) {
        params.search = filters.search;
      }
      if (filters?.isActive !== undefined) {
        params.is_active = filters.isActive;
      }

      // Check if user is authenticated
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No authentication token found. User needs to log in.');
        // Return empty data instead of throwing to prevent UI errors
        return [];
      }

      try {
        const response = await api.get('/branches', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching branches:', error);
        if (error.response?.status === 401) {
          console.error('Authentication failed. Redirecting to login...');
          // Clear invalid token and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        throw error;
      }
    },
  });

  // Initialize selected branch from localStorage
  useEffect(() => {
    const savedBranchId = localStorage.getItem(SELECTED_BRANCH_KEY);
    if (savedBranchId && queryResult.data) {
      const branch = queryResult.data.find((b: any) => b.id === savedBranchId);
      if (branch) {
        setSelectedBranchState(branch);
      }
    } else if (queryResult.data && queryResult.data.length > 0 && !selectedBranch) {
      setSelectedBranchState(queryResult.data[0]);
    }
  }, [queryResult.data, selectedBranch]);

  const setSelectedBranch = (branch: any) => {
    if (branch) {
      localStorage.setItem(SELECTED_BRANCH_KEY, branch.id);
    } else {
      localStorage.removeItem(SELECTED_BRANCH_KEY);
    }
    setSelectedBranchState(branch);
  };

  return {
    ...queryResult,
    branches: queryResult.data || [],
    selectedBranch: selectedBranch || (queryResult.data?.[0] || null),
    setSelectedBranch
  };
};

export const useBranchById = (branchId: string) => {
  return useQuery({
    queryKey: ['branches', branchId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/branches/${branchId}`);
      return response.data;
    },
    enabled: !!branchId
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (branchData: any) => {
      const response = await api.post('/api/v1/branches', branchData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: 'Success',
        description: 'Branch created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create branch',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ branchId, data }: { branchId: string; data: any }) => {
      const response = await api.put(`/api/v1/branches/${branchId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branches', variables.branchId] });
      toast({
        title: 'Success',
        description: 'Branch updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update branch',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (branchId: string) => {
      await api.delete(`/api/v1/branches/${branchId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: 'Success',
        description: 'Branch deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete branch',
        variant: 'destructive',
      });
    },
  });
};
