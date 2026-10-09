function readBooleanFlag(value: string | undefined): boolean {
  if (!value) return false;
  return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  appName: import.meta.env.VITE_APP_NAME ?? 'Contract Farming',
  appEnv: import.meta.env.VITE_APP_ENV?.trim() ?? '',
  enableDevtools: readBooleanFlag(import.meta.env.VITE_ENABLE_DEVTOOLS),
} as const;

/** True only when `VITE_APP_ENV` is Development. Production and other values hide the topbar badge. */
export const isDevelopmentEnv = env.appEnv.toLowerCase() === 'development';
