import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { useSeedSizes } from '@/features/master/api/use-seed-sizes';
import type { SeedSize } from '@/features/master/types';
import { getApiErrorMessage } from '@/lib/api-client';
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
  const { data: seedSizes, isPending, isError, error } = useSeedSizes();
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [editingSeedSize, setEditingSeedSize] = useState<SeedSize | null>(null);
  const [deletingSeedSize, setDeletingSeedSize] = useState<SeedSize | null>(null);
  const canDeleteAll = (seedSizes?.length ?? 0) > 0;

  return (
    <PageCard>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle>Seed Sizes</CardTitle>
        <CardDescription className="hidden sm:block">
          Manage seed size classifications. Define and maintain seed size options used in
          requisitions and dispatches.
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
            onClick={() => onCreateOpenChange(true)}
          >
            <PlusIcon />
          </Button>
        </CardAction>
      </PageCardHeader>
      <PageCardContent>
        {isPending && seedSizes === undefined ? (
          <p className="text-sm text-muted-foreground">Loading seed sizes…</p>
        ) : null}

        {isError && seedSizes === undefined ? (
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        ) : null}

        {seedSizes !== undefined ? (
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
      <CreateSeedSizeDrawer open={createOpen} onOpenChange={onCreateOpenChange} />
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
        count={seedSizes?.length ?? 0}
      />
    </PageCard>
  );
}
