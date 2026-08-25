import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { env } from '@/lib/env';

export const authClient = createAuthClient({
  baseURL: env.apiBaseUrl,
  fetchOptions: { credentials: 'include' },
  plugins: [adminClient()],
});
