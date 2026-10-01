import { Link } from '@tanstack/react-router';
import { ArrowLeft, Truck } from 'lucide-react';
import { useMemo } from 'react';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { useFacilities } from '@/features/master/api/use-facilities';
import { useGenerations } from '@/features/master/api/use-generations';
import { useSeedSizes } from '@/features/master/api/use-seed-sizes';
import { useDispatchableRequisitions } from '@/features/seed-dispatch/create/api/use-dispatchable-requisitions';
import { DispatchCreateForm } from '@/features/seed-dispatch/create/components/dispatch-create-form';
import { buildDispatchFormOptions } from '@/features/seed-dispatch/create/lib/form-options';
import { getApiErrorMessage } from '@/lib/api-client';

export default function CreateSeedDispatchPage() {
  const {
    data: awaiting = [],
    isPending: isAwaitingPending,
    isError: isAwaitingError,
    error: awaitingError,
  } = useDispatchableRequisitions();
  const {
    data: facilities = [],
    isPending: isFacilitiesPending,
    isError: isFacilitiesError,
    error: facilitiesError,
  } = useFacilities();
  const {
    data: sizes = [],
    isPending: isSizesPending,
    isError: isSizesError,
    error: sizesError,
  } = useSeedSizes();
  const {
    data: generations = [],
    isPending: isGenerationsPending,
    isError: isGenerationsError,
    error: generationsError,
  } = useGenerations();

  const formOptions = useMemo(
    () =>
      buildDispatchFormOptions({
        facilities,
        sizes,
        generations,
      }),
    [facilities, sizes, generations],
  );

  const isPending =
    isAwaitingPending || isFacilitiesPending || isSizesPending || isGenerationsPending;
  const isError = isAwaitingError || isFacilitiesError || isSizesError || isGenerationsError;
  const error = awaitingError ?? facilitiesError ?? sizesError ?? generationsError;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
          <Link to="/seed-dispatches/overview">
            <ArrowLeft className="size-4" />
            Back to overview
          </Link>
        </Button>
      </div>

      <PageCard className="border-border/50 w-full min-w-0 shadow-sm">
        <PageCardHeader className="border-border/50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <Truck className="size-4" aria-hidden />
            </span>
            Create Dispatch
          </CardTitle>
          <CardDescription className="hidden sm:block">
            Select approved requisitions, assign graded bag lines, then enter truck and weighbridge
            details.
          </CardDescription>
        </PageCardHeader>
        <PageCardContent className="min-w-0 overflow-hidden">
          {isPending ? (
            <DataTableSkeleton />
          ) : isError ? (
            <p className="text-destructive py-8 text-center text-sm">
              {getApiErrorMessage(error, 'Failed to load dispatch form data.')}
            </p>
          ) : (
            <DispatchCreateForm requisitions={awaiting} formOptions={formOptions} />
          )}
        </PageCardContent>
      </PageCard>
    </div>
  );
}
