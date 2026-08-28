import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Marker, MarkerContent } from '@/components/ui/marker';
import { Spinner } from '@/components/ui/spinner';

const SHOW_DELAY_MS = 200;

export function AppLoader() {
  const pendingQueries = useIsFetching({
    predicate: (query) => query.state.status === 'pending',
  });
  const pendingMutations = useIsMutating();
  const isBusy = pendingQueries + pendingMutations > 0;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isBusy) {
      const timeoutId = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
      return () => window.clearTimeout(timeoutId);
    }

    setVisible(false);
  }, [isBusy]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-4 px-4">
        <Spinner className="size-8 text-primary" />
        <Marker variant="separator">
          <MarkerContent>Please wait</MarkerContent>
        </Marker>
      </div>
    </div>
  );
}
