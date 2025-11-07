import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { MFASetupResponse, MFAStatus, MFAVerifyInput, MFAEnableInput } from '@/types/mfa';

export const useMFAStatus = () => {
  return useQuery<MFAStatus>({
    queryKey: ['mfa', 'status'],
    queryFn: async () => {
      const { data } = await api.get('/api/mfa/status');
      return data;
    },
  });
};

export const useSetupMFA = () => {
  return useMutation<MFASetupResponse>({
    mutationFn: async () => {
      const { data } = await api.post('/api/mfa/setup');
      return data;
    },
  });
};

export const useEnableMFA = () => {
  return useMutation<void, Error, MFAEnableInput>({
    mutationFn: async (input) => {
      await api.post('/api/mfa/enable', input);
    },
  });
};

export const useDisableMFA = () => {
  return useMutation<void>({
    mutationFn: async () => {
      await api.post('/api/mfa/disable');
    },
  });
};

export const useVerifyMFA = () => {
  return useMutation<void, Error, MFAVerifyInput>({
    mutationFn: async (input) => {
      await api.post('/api/mfa/verify', input);
    },
  });
};

export const useGenerateBackupCodes = () => {
  return useMutation<{ backupCodes: string[] }>({
    mutationFn: async () => {
      const { data } = await api.post('/api/mfa/backup-codes');
      return data;
    },
  });
};

export const useVerifyBackupCode = () => {
  return useMutation<void, Error, { code: string }>({
    mutationFn: async (input) => {
      await api.post('/api/mfa/verify-backup', input);
    },
  });
};
