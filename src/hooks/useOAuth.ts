import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { OAuthAccount, OAuthProvider, OAuthLinkInput, OAuthUnlinkInput } from '@/types/oauth';

export const useOAuthAccounts = () => {
  return useQuery<OAuthAccount[]>({
    queryKey: ['oauth', 'accounts'],
    queryFn: async () => {
      const { data } = await api.get('/api/oauth/accounts');
      return data;
    },
  });
};

export const useInitiateOAuth = () => {
  return useMutation<{ url: string }, Error, { provider: OAuthProvider }>({
    mutationFn: async ({ provider }) => {
      const { data } = await api.get(`/api/oauth/${provider}`);
      return data;
    },
  });
};

export const useLinkOAuthAccount = () => {
  return useMutation<void, Error, OAuthLinkInput>({
    mutationFn: async (input) => {
      await api.post('/api/oauth/link', input);
    },
  });
};

export const useUnlinkOAuthAccount = () => {
  return useMutation<void, Error, OAuthUnlinkInput>({
    mutationFn: async (input) => {
      await api.post('/api/oauth/unlink', input);
    },
  });
};
