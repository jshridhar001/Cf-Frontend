import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { useGenerations } from '@/features/master/api/use-generations';
import type { Generation } from '@/features/master/types';
import { getApiErrorMessage } from '@/lib/api-client';
import { CreateGenerationDrawer } from './create-generation-drawer';
import { DeleteAllGenerationsDialog } from './delete-all-generations-dialog';
import { DeleteGenerationDialog } from './delete-generation-dialog';
import { EditGenerationDrawer } from './edit-generation-drawer';
import { columns } from './generation-table-column';
import { GenerationsTable } from './generations-table';

interface GenerationsTabContentProps {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}

export function GenerationsTabContent({
  createOpen,
  onCreateOpenChange,
}: GenerationsTabContentProps) {
  const { data: generations, isPending, isError, error } = useGenerations();
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [editingGeneration, setEditingGeneration] = useState<Generation | null>(null);
  const [deletingGeneration, setDeletingGeneration] = useState<Generation | null>(null);
  const canDeleteAll = (generations?.length ?? 0) > 0;

  return (
    <PageCard>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle>Generations</CardTitle>
        <CardDescription className="hidden sm:block">
          Manage seed generations. Define generation levels used across seed tracking.
        </CardDescription>
        <CardAction className="flex items-center gap-1 md:hidden">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Delete all generations"
            disabled={!canDeleteAll}
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash2Icon />
          </Button>
          <Button
            type="button"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Add generation"
            onClick={() => onCreateOpenChange(true)}
          >
            <PlusIcon />
          </Button>
        </CardAction>
      </PageCardHeader>
      <PageCardContent>
        {isPending && generations === undefined ? (
          <p className="text-sm text-muted-foreground">Loading generations…</p>
        ) : null}

        {isError && generations === undefined ? (
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        ) : null}

        {generations !== undefined ? (
          <GenerationsTable
            columns={columns}
            data={generations}
            onAdd={() => onCreateOpenChange(true)}
            onDeleteAll={() => setDeleteAllOpen(true)}
            deleteAllDisabled={!canDeleteAll}
            onEdit={setEditingGeneration}
            onDelete={setDeletingGeneration}
          />
        ) : null}
      </PageCardContent>
      <CreateGenerationDrawer open={createOpen} onOpenChange={onCreateOpenChange} />
      <EditGenerationDrawer
        generation={editingGeneration}
        open={editingGeneration !== null}
        onOpenChange={(open) => {
          if (!open) setEditingGeneration(null);
        }}
      />
      <DeleteGenerationDialog
        generation={deletingGeneration}
        open={deletingGeneration !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingGeneration(null);
        }}
      />
      <DeleteAllGenerationsDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        count={generations?.length ?? 0}
      />
    </PageCard>
  );
}
