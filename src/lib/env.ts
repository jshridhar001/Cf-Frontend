const DEFAULT_APP_NAME = 'Contract Farming';

function readBooleanFlag(value: string | undefined): boolean {
  if (!value) return false;
  return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function readAppName(value: string | undefined): string {
  if (!value) return DEFAULT_APP_NAME;
  const trimmed = value.trim();
  // Reject accidental paste of Netlify/Vercel env docs (markdown tables, headings).
  if (!trimmed || trimmed.length > 80 || /[|#\n]/.test(trimmed)) {
    return DEFAULT_APP_NAME;
  }
  return trimmed;
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  appName: readAppName(import.meta.env.VITE_APP_NAME),
  enableDevtools: readBooleanFlag(import.meta.env.VITE_ENABLE_DEVTOOLS),
} as const;
