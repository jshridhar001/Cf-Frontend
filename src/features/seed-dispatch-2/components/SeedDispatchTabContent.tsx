import { useCallback } from 'react';
import { Truck } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AccessControlTableSkeleton } from '@/features/access-control/components/access-control-table-skeleton';
import { useDispatchableRequisitions } from '@/features/seed-dispatch/api/use-dispatchable-requisitions';
import { useNullifySeedDispatch } from '@/features/seed-dispatch/api/use-nullify-seed-dispatch';
import { useSeedDispatches } from '@/features/seed-dispatch/api/use-seed-dispatches';
import { useUpdateSeedDispatchStatus } from '@/features/seed-dispatch/api/use-update-seed-dispatch-status';
import { getApiErrorMessage } from '@/lib/api-client';

import { SeedDispatchOverview } from './SeedDispatchOverview';

export function SeedDispatchTabContent() {
  const {
    data: dispatches = [],
    isPending: isDispatchesPending,
    isError: isDispatchesError,
    error: dispatchesError,
  } = useSeedDispatches();
  const {
    data: awaiting = [],
    isPending: isAwaitingPending,
    isError: isAwaitingError,
    error: awaitingError,
  } = useDispatchableRequisitions();
  const { mutateAsync: nullifyDispatch } = useNullifySeedDispatch();
  const { mutateAsync: updateStatus } = useUpdateSeedDispatchStatus();

  const isPending = isDispatchesPending || isAwaitingPending;
  const isError = isDispatchesError || isAwaitingError;
  const error = dispatchesError ?? awaitingError;

  const handleMarkAsNull = useCallback(
    async (id: string) => {
      const dispatch = dispatches.find((row) => row.id === id);
      await nullifyDispatch({ dispatchId: id, truckNumber: dispatch?.truckNumber });
    },
    [dispatches, nullifyDispatch],
  );

  const handleMarkInTransit = useCallback(
    async (id: string) => {
      const dispatch = dispatches.find((row) => row.id === id);
      await updateStatus({
        dispatchId: id,
        status: 'IN_TRANSIT',
        truckNumber: dispatch?.truckNumber,
      });
    },
    [dispatches, updateStatus],
  );

  return (
    <Card className="border-border/50 w-full min-w-0 shadow-sm">
      <CardHeader className="border-border/50 border-b pb-5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Truck className="size-4" aria-hidden />
          </span>
          Seed Dispatches
        </CardTitle>
        <CardDescription className="max-md:text-xs">
          Manage seed dispatches and track requisitions awaiting fulfillment.
        </CardDescription>
      </CardHeader>

      <CardContent className="min-w-0 overflow-hidden pt-5">
        {isPending ? (
          <AccessControlTableSkeleton columnCount={8} actionButtonCount={2} />
        ) : isError ? (
          <p className="text-destructive py-8 text-center text-sm">
            {getApiErrorMessage(error, 'Failed to load seed dispatches.')}
          </p>
        ) : (
          <SeedDispatchOverview
            data={dispatches}
            awaiting={awaiting}
            onMarkAsNull={handleMarkAsNull}
            onMarkInTransit={handleMarkInTransit}
          />
        )}
      </CardContent>
    </Card>
  );
}
