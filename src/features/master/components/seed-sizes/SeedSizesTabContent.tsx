import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { useSeedSizes } from '@/features/master/api/use-seed-sizes';
import { useVarieties } from '@/features/master/api/use-varieties';
import type { SeedSize } from '@/features/master/types';
import { getApiErrorMessage } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { CreateSeedSizeDrawer } from './create-seed-size-drawer';
import { DeleteAllSeedSizesDialog } from './delete-all-seed-sizes-dialog';
import { DeleteSeedSizeDialog } from './delete-seed-size-dialog';
import { EditSeedSizeDrawer } from './edit-seed-size-drawer';
import { columns } from './seed-size-table-column';
import { SeedSizesTable } from './seed-sizes-table';

interface SeedSizesTabContentProps {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}

export function SeedSizesTabContent({ createOpen, onCreateOpenChange }: SeedSizesTabContentProps) {
  const {
    data: varieties,
    isPending: varietiesPending,
    isError: varietiesError,
    error: varietiesQueryError,
  } = useVarieties();
  const [selectedVarietyId, setSelectedVarietyId] = useState<string | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [editingSeedSize, setEditingSeedSize] = useState<SeedSize | null>(null);
  const [deletingSeedSize, setDeletingSeedSize] = useState<SeedSize | null>(null);

  const activeVariety =
    varieties?.find((variety) => variety.id === selectedVarietyId) ?? varieties?.[0] ?? null;
  const {
    data: seedSizes,
    isPending: seedSizesPending,
    isError: seedSizesError,
    error: seedSizesQueryError,
  } = useSeedSizes(activeVariety?.id, { enabled: activeVariety !== null });
  const canDeleteAll = (seedSizes?.length ?? 0) > 0;
  const isPending =
    (varietiesPending && varieties === undefined) ||
    (activeVariety !== null && seedSizesPending && seedSizes === undefined);
  const loadError = varietiesError
    ? varietiesQueryError
    : seedSizesError
      ? seedSizesQueryError
      : null;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
      <nav
        aria-label="Varieties"
        className="flex gap-1 overflow-x-auto md:w-52 md:shrink-0 md:flex-col md:overflow-visible"
      >
        {(varieties ?? []).map((variety) => {
          const isActive = variety.id === activeVariety?.id;

          return (
            <button
              key={variety.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setSelectedVarietyId(variety.id)}
              className={cn(
                'relative min-h-11 shrink-0 rounded-md px-3 text-left text-sm font-medium whitespace-nowrap transition-colors md:min-h-9 md:w-full',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {variety.name}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute bg-foreground transition-opacity',
                  'right-3 bottom-1 left-3 h-0.5 md:inset-y-2 md:right-auto md:left-0 md:h-auto md:w-0.5',
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
              />
            </button>
          );
        })}
      </nav>

      <div className="min-w-0 flex-1">
        <PageCard>
          <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
            <CardTitle>Seed Sizes</CardTitle>
            <CardDescription className="hidden sm:block">
              {activeVariety
                ? `Manage seed sizes and bags per acre for ${activeVariety.name}.`
                : 'Manage seed size classifications used in requisitions and dispatches.'}
            </CardDescription>
            <CardAction className="flex items-center gap-1 md:hidden">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="min-h-11 min-w-11"
                aria-label="Delete all seed sizes"
                disabled={!canDeleteAll}
                onClick={() => setDeleteAllOpen(true)}
              >
                <Trash2Icon />
              </Button>
              <Button
                type="button"
                size="icon"
                className="min-h-11 min-w-11"
                aria-label="Add seed size"
                disabled={activeVariety === null}
                onClick={() => onCreateOpenChange(true)}
              >
                <PlusIcon />
              </Button>
            </CardAction>
          </PageCardHeader>
          <PageCardContent>
            {isPending ? <DataTableSkeleton /> : null}

            {loadError ? (
              <p className="text-sm text-destructive">{getApiErrorMessage(loadError)}</p>
            ) : null}

            {!isPending && !loadError && varieties?.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add a variety before creating seed sizes.
              </p>
            ) : null}

            {!isPending && !loadError && activeVariety && seedSizes !== undefined ? (
              <SeedSizesTable
                columns={columns}
                data={seedSizes}
                onAdd={() => onCreateOpenChange(true)}
                onDeleteAll={() => setDeleteAllOpen(true)}
                deleteAllDisabled={!canDeleteAll}
                onEdit={setEditingSeedSize}
                onDelete={setDeletingSeedSize}
              />
            ) : null}
          </PageCardContent>
          {activeVariety ? (
            <CreateSeedSizeDrawer
              varietyId={activeVariety.id}
              open={createOpen}
              onOpenChange={onCreateOpenChange}
            />
          ) : null}
          <EditSeedSizeDrawer
            seedSize={editingSeedSize}
            open={editingSeedSize !== null}
            onOpenChange={(open) => {
              if (!open) setEditingSeedSize(null);
            }}
          />
          <DeleteSeedSizeDialog
            seedSize={deletingSeedSize}
            open={deletingSeedSize !== null}
            onOpenChange={(open) => {
              if (!open) setDeletingSeedSize(null);
            }}
          />
          <DeleteAllSeedSizesDialog
            open={deleteAllOpen}
            onOpenChange={setDeleteAllOpen}
            seedSizeIds={seedSizes?.map((seedSize) => seedSize.id) ?? []}
            varietyName={activeVariety?.name ?? 'this variety'}
          />
        </PageCard>
      </div>
    </div>
  );
}
