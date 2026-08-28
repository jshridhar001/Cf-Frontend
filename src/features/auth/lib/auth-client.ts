import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { beginRequest, endRequest } from '@/lib/api-pending-store';
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
    onRequest: (context) => {
      beginRequest();
      return context;
    },
    onResponse: (context) => {
      endRequest();
      return context;
    },
    customFetchImpl: async (input, init) => {
      try {
        return await globalThis.fetch(input, init);
      } catch (error) {
        endRequest();
        throw error;
      }
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
