import { useApiMutation, buildEndpoint } from './useApiQuery';

export interface CreateAdminData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  subscription_plan: string;
  date_of_birth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  gym_name?: string;
  existing_gym_id?: string;
  existing_branch_id?: string;
}

export interface CreateStaffData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: 'manager' | 'staff' | 'trainer';
  branch_id: string;
  gym_id: string;
  avatar_url?: string;
}

export const useCreateAdminUser = () => {
  return useApiMutation<any, CreateAdminData>(
    '/api/users/create-admin',
    'post',
    {
      successMessage: 'Admin user created successfully',
    }
  );
};

export const useCreateStaffUser = () => {
  return useApiMutation<any, CreateStaffData>(
    '/api/users',
    'post',
    {
      invalidateQueries: [['team-members']],
      successMessage: 'Staff user created successfully',
    }
  );
};

export const useEnableMemberLogin = () => {
  return useApiMutation(
    '/api/users/enable-member-login',
    'post',
    {
      successMessage: 'Member login enabled successfully',
    }
  );
};
