import type { ErrorComponentProps } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { BRAND_LOGO_SRC } from '@/lib/brand';
import { isConnectionTimeout, isNetworkError } from '@/lib/http-error';

const TIMEOUT_RETRY_MS = 1000;

export function ConnectionLoader() {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-4 py-8">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <img
          src={BRAND_LOGO_SRC}
          alt="Bhatti Agritech Contract Farming"
          className="size-16 shrink-0 rounded-md sm:size-20"
        />
        <div className="flex items-center gap-2">
          <Spinner className="size-4" />
          <p className="text-sm text-muted-foreground">Connecting…</p>
        </div>
      </div>
    </div>
  );
}

export function RouteErrorFallback({ error, reset }: ErrorComponentProps) {
  const timedOut = isConnectionTimeout(error);
  const resetRef = useRef(reset);
  resetRef.current = reset;

  useEffect(() => {
    if (!timedOut) return;
    const id = window.setTimeout(() => resetRef.current(), TIMEOUT_RETRY_MS);
    return () => window.clearTimeout(id);
  }, [timedOut]);

  if (timedOut) return <ConnectionLoader />;

  const unreachable = isNetworkError(error);

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-4 py-8">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <img
          src={BRAND_LOGO_SRC}
          alt="Bhatti Agritech Contract Farming"
          className="size-16 shrink-0 rounded-md sm:size-20"
        />
        <div className="flex flex-col items-center gap-2">
          <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            {unreachable ? 'Can’t reach the server' : 'Couldn’t load this page'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {unreachable
              ? 'The server is not responding. Check your connection and try again.'
              : 'Try again in a moment.'}
          </p>
        </div>
        <Button type="button" onClick={() => reset()}>
          Retry
        </Button>
      </div>
    </div>
  );
}
