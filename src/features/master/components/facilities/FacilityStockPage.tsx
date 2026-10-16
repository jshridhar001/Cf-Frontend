import { Link } from '@tanstack/react-router';
import { ArrowLeft, PlusIcon, Trash2Icon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { useFacilities } from '@/features/master/api/use-facilities';
import { useFacilityStock } from '@/features/master/api/use-facility-stock';
import { useGenerations } from '@/features/master/api/use-generations';
import { useSeedSizes } from '@/features/master/api/use-seed-sizes';
import { useVarieties } from '@/features/master/api/use-varieties';
import { getApiErrorMessage } from '@/lib/api-client';
import { CreateFacilityStockDrawer } from './create-facility-stock-drawer';
import { DeleteAllFacilityStockDialog } from './delete-all-facility-stock-dialog';
import { DeleteFacilityStockDialog } from './delete-facility-stock-dialog';
import { EditFacilityStockDrawer } from './edit-facility-stock-drawer';
import { FacilityStockTable } from './facility-stock-table';
import { columns, type FacilityStockTableRow } from './facility-stock-table-column';

function nameById(items: { id: string; name: string }[] | undefined, id: string) {
  return items?.find((item) => item.id === id)?.name ?? '—';
}

export function FacilityStockPage({ facilityId }: { facilityId: string }) {
  const { data: facilities } = useFacilities();
  const { data: stock, isPending, isError, error } = useFacilityStock(facilityId);
  const { data: varieties } = useVarieties();
  const { data: seedSizes } = useSeedSizes();
  const { data: generations } = useGenerations();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<FacilityStockTableRow | null>(null);
  const [deletingStock, setDeletingStock] = useState<FacilityStockTableRow | null>(null);

  const facilityName =
    facilities?.find((facility) => facility.id === facilityId)?.name ?? 'Facility';
  const rows = useMemo<FacilityStockTableRow[]>(
    () =>
      (stock ?? []).map((row) => ({
        ...row,
        varietyName: nameById(varieties, row.varietyId),
        sizeName: nameById(seedSizes, row.sizeId),
        generationName: nameById(generations, row.generationId),
      })),
    [generations, seedSizes, stock, varieties],
  );
  const canDeleteAll = rows.length > 0;

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 min-h-11 w-fit text-muted-foreground hover:text-foreground md:min-h-8"
        asChild
      >
        <Link to="/master/facilities">
          <ArrowLeft className="size-4" />
          Go back
        </Link>
      </Button>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
        {facilityName}
      </h1>
      <PageCard>
        <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
          <CardTitle>Stock</CardTitle>
          <CardDescription className="hidden sm:block">
            Manage variety, seed size, generation, and the initial and current quantity stored at
            this facility.
          </CardDescription>
          <CardAction className="flex items-center gap-1 md:hidden">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label="Delete all facility stock"
              disabled={!canDeleteAll}
              onClick={() => setDeleteAllOpen(true)}
            >
              <Trash2Icon />
            </Button>
            <Button
              type="button"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label="Add stock"
              onClick={() => setCreateOpen(true)}
            >
              <PlusIcon />
            </Button>
          </CardAction>
        </PageCardHeader>
        <PageCardContent>
          {isPending && stock === undefined ? <DataTableSkeleton /> : null}

          {isError && stock === undefined ? (
            <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
          ) : null}

          {stock !== undefined ? (
            <FacilityStockTable
              columns={columns}
              data={rows}
              onAdd={() => setCreateOpen(true)}
              onDeleteAll={() => setDeleteAllOpen(true)}
              deleteAllDisabled={!canDeleteAll}
              onEdit={setEditingStock}
              onDelete={setDeletingStock}
            />
          ) : null}
        </PageCardContent>
        <CreateFacilityStockDrawer
          facilityId={facilityId}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
        <EditFacilityStockDrawer
          stock={editingStock}
          open={editingStock !== null}
          onOpenChange={(open) => {
            if (!open) setEditingStock(null);
          }}
        />
        <DeleteFacilityStockDialog
          stock={deletingStock}
          open={deletingStock !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingStock(null);
          }}
        />
        <DeleteAllFacilityStockDialog
          open={deleteAllOpen}
          onOpenChange={setDeleteAllOpen}
          count={rows.length}
        />
      </PageCard>
    </div>
  );
}
