import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AppLoader } from '@/components/app-loader';
import { TanStackAppDevtools } from '@/components/tanstack-devtools';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { env } from './lib/env';
import { queryClient } from './lib/queryClient';
import { router } from './router';

export function Providers() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider delayDuration={0}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} context={{ queryClient }} />
          <AppLoader />
          <Toaster />
          {env.enableDevtools ? <TanStackAppDevtools router={router} /> : null}
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
