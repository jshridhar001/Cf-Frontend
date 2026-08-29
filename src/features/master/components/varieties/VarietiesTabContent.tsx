import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { useVarieties } from '@/features/master/api/use-varieties';
import type { Variety } from '@/features/master/types';
import { getApiErrorMessage } from '@/lib/api-client';
import { CreateVarietyDrawer } from './create-variety-drawer';
import { DeleteAllVarietiesDialog } from './delete-all-varieties-dialog';
import { DeleteVarietyDialog } from './delete-variety-dialog';
import { EditVarietyDrawer } from './edit-variety-drawer';
import { VarietiesTable } from './varieties-table';
import { columns } from './varieties-table-column';

interface VarietiesTabContentProps {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}

export function VarietiesTabContent({ createOpen, onCreateOpenChange }: VarietiesTabContentProps) {
  const { data: varieties, isPending, isError, error } = useVarieties();
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [editingVariety, setEditingVariety] = useState<Variety | null>(null);
  const [deletingVariety, setDeletingVariety] = useState<Variety | null>(null);
  const canDeleteAll = (varieties?.length ?? 0) > 0;

  return (
    <PageCard>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle>Varieties</CardTitle>
        <CardDescription className="hidden sm:block">
          Manage the crop varieties for this season. These varieties will appear in all variety
          dropdowns across the system.
        </CardDescription>
        <CardAction className="flex items-center gap-1 md:hidden">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Delete all varieties"
            disabled={!canDeleteAll}
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash2Icon />
          </Button>
          <Button
            type="button"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Add variety"
            onClick={() => onCreateOpenChange(true)}
          >
            <PlusIcon />
          </Button>
        </CardAction>
      </PageCardHeader>
      <PageCardContent>
        {isPending && varieties === undefined ? (
          <p className="text-sm text-muted-foreground">Loading varieties…</p>
        ) : null}

        {isError && varieties === undefined ? (
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        ) : null}

        {varieties !== undefined ? (
          <VarietiesTable
            columns={columns}
            data={varieties}
            onAdd={() => onCreateOpenChange(true)}
            onDeleteAll={() => setDeleteAllOpen(true)}
            deleteAllDisabled={!canDeleteAll}
            onEdit={setEditingVariety}
            onDelete={setDeletingVariety}
          />
        ) : null}
      </PageCardContent>
      <CreateVarietyDrawer open={createOpen} onOpenChange={onCreateOpenChange} />
      <EditVarietyDrawer
        variety={editingVariety}
        open={editingVariety !== null}
        onOpenChange={(open) => {
          if (!open) setEditingVariety(null);
        }}
      />
      <DeleteVarietyDialog
        variety={deletingVariety}
        open={deletingVariety !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingVariety(null);
        }}
      />
      <DeleteAllVarietiesDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        count={varieties?.length ?? 0}
      />
    </PageCard>
  );
}
