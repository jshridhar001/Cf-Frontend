import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { router } from '@/router';
import { authClient } from '../lib/auth-client';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: async () => {
      const result = await authClient.signOut();
      if (result.error) {
        throw result.error;
      }
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      queryClient.clear();
      void router.navigate({ to: '/', replace: true });
    },
    onError: () => {
      queryClient.clear();
      void router.navigate({ to: '/', replace: true });
      toast.error('Signed out locally. Server sign-out may have failed.', {
        position: 'bottom-right',
      });
    },
  });
}
