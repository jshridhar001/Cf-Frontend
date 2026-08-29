import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { useTuberSizes } from '@/features/master/api/use-tuber-sizes';
import type { TuberSize } from '@/features/master/types';
import { getApiErrorMessage } from '@/lib/api-client';
import { CreateTuberSizeDrawer } from './create-tuber-size-drawer';
import { DeleteAllTuberSizesDialog } from './delete-all-tuber-sizes-dialog';
import { DeleteTuberSizeDialog } from './delete-tuber-size-dialog';
import { EditTuberSizeDrawer } from './edit-tuber-size-drawer';
import { columns } from './tuber-size-table-column';
import { TuberSizesTable } from './tuber-sizes-table';

interface TuberSizesTabContentProps {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}

export function TuberSizesTabContent({
  createOpen,
  onCreateOpenChange,
}: TuberSizesTabContentProps) {
  const { data: tuberSizes, isPending, isError, error } = useTuberSizes();
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [editingTuberSize, setEditingTuberSize] = useState<TuberSize | null>(null);
  const [deletingTuberSize, setDeletingTuberSize] = useState<TuberSize | null>(null);
  const canDeleteAll = (tuberSizes?.length ?? 0) > 0;

  return (
    <PageCard>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle>Tuber Sizes</CardTitle>
        <CardDescription className="hidden sm:block">
          Manage tuber size classifications. Define and maintain tuber size options used in
          operations.
        </CardDescription>
        <CardAction className="flex items-center gap-1 md:hidden">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Delete all tuber sizes"
            disabled={!canDeleteAll}
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash2Icon />
          </Button>
          <Button
            type="button"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Add tuber size"
            onClick={() => onCreateOpenChange(true)}
          >
            <PlusIcon />
          </Button>
        </CardAction>
      </PageCardHeader>
      <PageCardContent>
        {isPending && tuberSizes === undefined ? (
          <p className="text-sm text-muted-foreground">Loading tuber sizes…</p>
        ) : null}

        {isError && tuberSizes === undefined ? (
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        ) : null}

        {tuberSizes !== undefined ? (
          <TuberSizesTable
            columns={columns}
            data={tuberSizes}
            onAdd={() => onCreateOpenChange(true)}
            onDeleteAll={() => setDeleteAllOpen(true)}
            deleteAllDisabled={!canDeleteAll}
            onEdit={setEditingTuberSize}
            onDelete={setDeletingTuberSize}
          />
        ) : null}
      </PageCardContent>
      <CreateTuberSizeDrawer open={createOpen} onOpenChange={onCreateOpenChange} />
      <EditTuberSizeDrawer
        tuberSize={editingTuberSize}
        open={editingTuberSize !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTuberSize(null);
        }}
      />
      <DeleteTuberSizeDialog
        tuberSize={deletingTuberSize}
        open={deletingTuberSize !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingTuberSize(null);
        }}
      />
      <DeleteAllTuberSizesDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        count={tuberSizes?.length ?? 0}
      />
    </PageCard>
  );
}
