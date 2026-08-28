import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { env } from '@/lib/env';
import { getAuthToken, setAuthToken } from './auth-token-store';

export const authClient = createAuthClient({
  baseURL: env.apiBaseUrl,
  fetchOptions: {
    credentials: 'omit',
    auth: {
      type: 'Bearer',
      token: () => getAuthToken() ?? '',
    },
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get('set-auth-token');
      if (authToken) {
        setAuthToken(authToken);
      }
    },
  },
  plugins: [adminClient()],
});
