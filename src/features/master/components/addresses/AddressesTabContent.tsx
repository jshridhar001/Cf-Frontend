import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { PageListSkeleton } from '@/components/page-list-skeleton';
import { PageTabsList, PageTabsTrigger } from '@/components/page-tabs';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useAddressList } from '@/features/master/api/use-addresses';
import { AddressEntityDrawer } from '@/features/master/components/addresses/address-entity-drawer';
import { AddressEntityTable } from '@/features/master/components/addresses/address-entity-table';
import { createAddressColumns } from '@/features/master/components/addresses/address-entity-table-column';
import { AddressParentFilter } from '@/features/master/components/addresses/address-parent-filter';
import { DeleteAddressDialog } from '@/features/master/components/addresses/delete-address-dialog';
import { DeleteAllAddressesDialog } from '@/features/master/components/addresses/delete-all-addresses-dialog';
import {
  ADDRESS_LEVEL_CONFIG,
  ADDRESS_LEVELS,
  type AddressLevel,
} from '@/features/master/lib/address-levels';
import type { AddressEntity } from '@/features/master/types/addresses';
import { getApiErrorMessage } from '@/lib/api-client';

interface AddressesTabContentProps {
  tab: AddressLevel;
  parentId?: string;
  createOpen: boolean;
  onTabChange: (tab: AddressLevel) => void;
  onParentIdChange: (parentId: string | undefined) => void;
  onCreateOpenChange: (open: boolean) => void;
}

export function AddressesTabContent({
  tab,
  parentId,
  createOpen,
  onTabChange,
  onParentIdChange,
  onCreateOpenChange,
}: AddressesTabContentProps) {
  return (
    <PageCard>
      <AddressLevelPanel
        key={tab}
        tab={tab}
        parentId={parentId}
        createOpen={createOpen}
        onTabChange={onTabChange}
        onParentIdChange={onParentIdChange}
        onCreateOpenChange={onCreateOpenChange}
      />
    </PageCard>
  );
}

function AddressLevelPanel({
  tab,
  parentId,
  createOpen,
  onTabChange,
  onParentIdChange,
  onCreateOpenChange,
}: AddressesTabContentProps) {
  const config = ADDRESS_LEVEL_CONFIG[tab];
  const { data: entities, isPending, isError, error } = useAddressList(tab, parentId);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<AddressEntity | null>(null);
  const [deletingEntity, setDeletingEntity] = useState<AddressEntity | null>(null);
  const columns = useMemo(() => createAddressColumns(tab), [tab]);
  const canDeleteAll = (entities?.length ?? 0) > 0;

  return (
    <>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle>Addresses</CardTitle>
        <CardDescription className="hidden sm:block">
          Manage states, districts, post offices, police stations, villages, and areas used across
          the system.
        </CardDescription>
        <CardAction className="flex items-center gap-1 md:hidden">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label={`Delete all ${config.label.toLowerCase()}`}
            disabled={!canDeleteAll}
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash2Icon />
          </Button>
          <Button
            type="button"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label={`Add ${config.singular.toLowerCase()}`}
            onClick={() => onCreateOpenChange(true)}
          >
            <PlusIcon />
          </Button>
        </CardAction>
      </PageCardHeader>
      <PageCardContent className="flex flex-col gap-4">
        <Tabs
          value={tab}
          onValueChange={(value) => onTabChange(value as AddressLevel)}
          className="gap-4"
        >
          <PageTabsList className="h-auto min-h-9 w-full flex-wrap justify-start md:flex-nowrap">
            {ADDRESS_LEVELS.map((level) => (
              <PageTabsTrigger key={level} value={level} className="md:flex-1">
                {ADDRESS_LEVEL_CONFIG[level].label}
              </PageTabsTrigger>
            ))}
          </PageTabsList>
          <TabsContent value={tab} className="mt-0">
            {isPending && entities === undefined ? <PageListSkeleton /> : null}

            {isError && entities === undefined ? (
              <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
            ) : null}

            {entities !== undefined ? (
              <AddressEntityTable
                level={tab}
                columns={columns}
                data={entities}
                filterSlot={
                  <AddressParentFilter
                    level={tab}
                    parentId={parentId}
                    onParentIdChange={onParentIdChange}
                  />
                }
                onAdd={() => onCreateOpenChange(true)}
                onDeleteAll={() => setDeleteAllOpen(true)}
                deleteAllDisabled={!canDeleteAll}
                onEdit={setEditingEntity}
                onDelete={setDeletingEntity}
              />
            ) : null}
          </TabsContent>
        </Tabs>
      </PageCardContent>
      <AddressEntityDrawer
        level={tab}
        open={createOpen}
        initialParentId={parentId}
        onOpenChange={onCreateOpenChange}
      />
      <AddressEntityDrawer
        level={tab}
        entity={editingEntity}
        open={editingEntity !== null}
        onOpenChange={(open) => {
          if (!open) setEditingEntity(null);
        }}
      />
      <DeleteAddressDialog
        level={tab}
        entity={deletingEntity}
        open={deletingEntity !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingEntity(null);
        }}
      />
      <DeleteAllAddressesDialog
        level={tab}
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        count={entities?.length ?? 0}
      />
    </>
  );
}
