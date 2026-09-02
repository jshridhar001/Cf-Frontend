import type { ErrorComponentProps } from '@tanstack/react-router';
import { TriangleAlert } from 'lucide-react';
import { RouteStatusScreen } from '@/components/route-status-screen';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api-client';
import { env } from '@/lib/env';

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  const message = getApiErrorMessage(error);

  return (
    <div className="flex min-h-dvh w-full flex-1 flex-col">
      <RouteStatusScreen
        code="500"
        icon={<TriangleAlert />}
        title="Something went wrong"
        description="This screen could not be loaded. You can try again, or go back to a stable page."
        detail={
          env.enableDevtools ? (
            <p className="w-full rounded-2xl bg-muted/60 px-3 py-2 text-left text-xs leading-relaxed text-muted-foreground">
              {message}
            </p>
          ) : null
        }
        actions={
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={reset}>
            Try again
          </Button>
        }
      />
    </div>
  );
}
