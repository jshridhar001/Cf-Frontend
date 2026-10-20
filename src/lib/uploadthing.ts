import { generateReactHelpers } from '@uploadthing/react';
import { env } from '@/lib/env';

export const { uploadFiles } = generateReactHelpers({
  url: `${env.apiBaseUrl}/api/uploadthing`,
});
