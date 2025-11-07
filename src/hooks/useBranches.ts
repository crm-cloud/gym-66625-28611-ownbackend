import { useQuery, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { ApiErrorResponse } from './useApiQuery';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

const SELECTED_BRANCH_KEY = 'selected_branch_id';

export const useBranches = (filters?: { search?: string; isActive?: boolean }) => {
  // Define Branch type based on your API response
  interface Branch {
    id: string;
    name: string;
    address?: string;
    is_active?: boolean;
    // Add other branch properties as needed
  }

  const [selectedBranch, setSelectedBranchState] = useState<Branch | null>(null);
  const queryClient = useQueryClient();
  
  const { authState } = useAuth();
  const { isAuthenticated, user } = authState;
  
  // Skip branch fetching for super admin
  const isSuperAdmin = user?.role === 'super-admin';
  const enabled = !isSuperAdmin && isAuthenticated;

  const queryResult = useQuery<Branch[], ApiErrorResponse>({
    queryKey: ['branches', filters?.search ?? '', filters?.isActive ?? 'all'],
    enabled, // Only enable the query if we have a token
    retry: 1, // Only retry once on failure
    queryFn: async (): Promise<Branch[]> => {
      const params: Record<string, string | boolean | number> = {};
      
      if (filters?.search) {
        params.search = filters.search;
      }
      if (filters?.isActive !== undefined) {
        params.is_active = filters.isActive;
      }

      try {
        // Skip API call for super admin
        if (isSuperAdmin) {
          return [];
        }
        // Use the new API path without version
        const response = await api.get('/api/branches', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching branches:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        
        if (error.response?.status === 401) {
          console.error('Authentication failed. Redirecting to login...');
          // Clear tokens and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          // Use a small timeout to allow the error to be logged before redirecting
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
        
        throw error;
      }
    },
  });

  // Initialize selected branch from localStorage
  useEffect(() => {
    const savedBranchId = localStorage.getItem(SELECTED_BRANCH_KEY);
    if (savedBranchId && queryResult.data) {
      const branch = queryResult.data.find((b) => b.id === savedBranchId);
      if (branch) {
        setSelectedBranchState(branch);
      }
    } else if (queryResult.data && queryResult.data.length > 0 && !selectedBranch) {
      setSelectedBranchState(queryResult.data[0]);
    }
  }, [queryResult.data, selectedBranch]);

  const setSelectedBranch = (branch: Branch | null) => {
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
      const response = await api.get(`/api/branches/${branchId}`);
      return response.data;
    },
    enabled: !!branchId
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  const createBranch = useMutation<Branch, ApiErrorResponse, Omit<Branch, 'id'>>({
    mutationFn: async (newBranch) => {
      const response = await api.post('/api/branches', newBranch);
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

  return createBranch;
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ branchId, data }: { branchId: string; data: any }) => {
      const response = await api.put(`/api/branches/${branchId}`, data);
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

  const deleteBranch = useMutation<void, ApiErrorResponse, string>({
    mutationFn: async (branchId) => {
      await api.delete(`/api/branches/${branchId}`);
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
