import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { useFacilities } from '@/features/master/api/use-facilities';
import type { Facility } from '@/features/master/types';
import { getApiErrorMessage } from '@/lib/api-client';
import { CreateFacilityDrawer } from './create-facility-drawer';
import { DeleteAllFacilitiesDialog } from './delete-all-facilities-dialog';
import { DeleteFacilityDialog } from './delete-facility-dialog';
import { EditFacilityDrawer } from './edit-facility-drawer';
import { FacilitiesTable } from './facilities-table';
import { columns } from './facility-table-column';

interface FacilitiesTabContentProps {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}

export function FacilitiesTabContent({
  createOpen,
  onCreateOpenChange,
}: FacilitiesTabContentProps) {
  const { data: facilities, isPending, isError, error } = useFacilities();
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [deletingFacility, setDeletingFacility] = useState<Facility | null>(null);
  const canDeleteAll = (facilities?.length ?? 0) > 0;

  return (
    <PageCard>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle>Facilities</CardTitle>
        <CardDescription className="hidden sm:block">
          Manage facilities. Keep facility records up to date for storage and operations.
        </CardDescription>
        <CardAction className="flex items-center gap-1 md:hidden">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Delete all facilities"
            disabled={!canDeleteAll}
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash2Icon />
          </Button>
          <Button
            type="button"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Add facility"
            onClick={() => onCreateOpenChange(true)}
          >
            <PlusIcon />
          </Button>
        </CardAction>
      </PageCardHeader>
      <PageCardContent>
        {isPending && facilities === undefined ? (
          <p className="text-sm text-muted-foreground">Loading facilities…</p>
        ) : null}

        {isError && facilities === undefined ? (
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        ) : null}

        {facilities !== undefined ? (
          <FacilitiesTable
            columns={columns}
            data={facilities}
            onAdd={() => onCreateOpenChange(true)}
            onDeleteAll={() => setDeleteAllOpen(true)}
            deleteAllDisabled={!canDeleteAll}
            onEdit={setEditingFacility}
            onDelete={setDeletingFacility}
          />
        ) : null}
      </PageCardContent>
      <CreateFacilityDrawer open={createOpen} onOpenChange={onCreateOpenChange} />
      <EditFacilityDrawer
        facility={editingFacility}
        open={editingFacility !== null}
        onOpenChange={(open) => {
          if (!open) setEditingFacility(null);
        }}
      />
      <DeleteFacilityDialog
        facility={deletingFacility}
        open={deletingFacility !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingFacility(null);
        }}
      />
      <DeleteAllFacilitiesDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        count={facilities?.length ?? 0}
      />
    </PageCard>
  );
}
