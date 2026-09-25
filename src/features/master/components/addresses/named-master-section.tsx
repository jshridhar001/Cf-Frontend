import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { useNamedMasters } from '@/features/master/api/use-named-masters';
import { type AddressMasterId, getAddressMaster } from '@/features/master/lib/address-masters';
import type { NamedMaster } from '@/features/master/types';
import { getApiErrorMessage } from '@/lib/api-client';
import { CreateNamedMasterDrawer } from './create-named-master-drawer';
import { DeleteAllNamedMastersDialog } from './delete-all-named-masters-dialog';
import { DeleteNamedMasterDialog } from './delete-named-master-dialog';
import { EditNamedMasterDrawer } from './edit-named-master-drawer';
import { NamedMasterTable } from './named-master-table';
import { createNamedMasterColumns } from './named-master-table-column';

interface NamedMasterSectionProps {
  resourceId: AddressMasterId;
}

export function NamedMasterSection({ resourceId }: NamedMasterSectionProps) {
  const resource = getAddressMaster(resourceId);
  const { data: items, isPending, isError, error } = useNamedMasters(resourceId);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NamedMaster | null>(null);
  const [deletingItem, setDeletingItem] = useState<NamedMaster | null>(null);
  const columns = useMemo(
    () => createNamedMasterColumns(`${resource.singularTitle} Name`),
    [resource.singularTitle],
  );
  const canDeleteAll = (items?.length ?? 0) > 0;

  return (
    <PageCard>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle>{resource.title}</CardTitle>
        <CardDescription className="hidden sm:block">{resource.description}</CardDescription>
        <CardAction className="flex items-center gap-1 md:hidden">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label={`Delete all ${resource.plural}`}
            disabled={!canDeleteAll}
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash2Icon />
          </Button>
          <Button
            type="button"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label={`Add ${resource.singular}`}
            onClick={() => setCreateOpen(true)}
          >
            <PlusIcon />
          </Button>
        </CardAction>
      </PageCardHeader>
      <PageCardContent>
        {isPending && items === undefined ? (
          <p className="text-sm text-muted-foreground">Loading {resource.plural}…</p>
        ) : null}

        {isError && items === undefined ? (
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        ) : null}

        {items !== undefined ? (
          <NamedMasterTable
            columns={columns}
            data={items}
            filterPlaceholder={`Filter ${resource.plural}…`}
            addLabel={`Add ${resource.singularTitle}`}
            onAdd={() => setCreateOpen(true)}
            onDeleteAll={() => setDeleteAllOpen(true)}
            deleteAllDisabled={!canDeleteAll}
            onEdit={setEditingItem}
            onDelete={setDeletingItem}
          />
        ) : null}
      </PageCardContent>
      <CreateNamedMasterDrawer
        resourceId={resourceId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <EditNamedMasterDrawer
        resourceId={resourceId}
        item={editingItem}
        open={editingItem !== null}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
        }}
      />
      <DeleteNamedMasterDialog
        resourceId={resourceId}
        item={deletingItem}
        open={deletingItem !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null);
        }}
      />
      <DeleteAllNamedMastersDialog
        resourceId={resourceId}
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        count={items?.length ?? 0}
      />
    </PageCard>
  );
}
