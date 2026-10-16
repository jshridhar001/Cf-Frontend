import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/lib/api-client';
import { useGatePasses } from '../api/use-gate-passes';
import type { ColdStorageGatePass } from '../types';
import { CreateGatePassDrawer } from './create-gate-pass-drawer';
import { DeleteGatePassDialog } from './delete-gate-pass-dialog';
import { EditGatePassDrawer } from './edit-gate-pass-drawer';
import { GatePassTable } from './gate-pass-table';
import { columns } from './gate-pass-table-column';
import { NullifyGatePassDialog } from './nullify-gate-pass-dialog';

export function CsGatePassPage() {
  const { data: gatePasses, isPending, isError, error } = useGatePasses();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ColdStorageGatePass | null>(null);
  const [nullifying, setNullifying] = useState<ColdStorageGatePass | null>(null);
  const [deleting, setDeleting] = useState<ColdStorageGatePass | null>(null);

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
        CS Gate Pass
      </h1>
      <PageCard>
        <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
          <CardTitle>Gate passes</CardTitle>
          <CardDescription className="hidden sm:block">
            Record seed leaving a cold storage. Creating a gate pass reduces that store&apos;s
            current quantity.
          </CardDescription>
          <CardAction className="flex items-center gap-1 md:hidden">
            <Button
              type="button"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label="Add gate pass"
              onClick={() => setCreateOpen(true)}
            >
              <PlusIcon />
            </Button>
          </CardAction>
        </PageCardHeader>
        <PageCardContent>
          {isPending && gatePasses === undefined ? <DataTableSkeleton /> : null}

          {isError && gatePasses === undefined ? (
            <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
          ) : null}

          {gatePasses !== undefined ? (
            <GatePassTable
              columns={columns}
              data={gatePasses}
              onAdd={() => setCreateOpen(true)}
              onEdit={setEditing}
              onNullify={setNullifying}
              onDelete={setDeleting}
            />
          ) : null}
        </PageCardContent>
        <CreateGatePassDrawer open={createOpen} onOpenChange={setCreateOpen} />
        <EditGatePassDrawer
          gatePass={editing}
          open={editing !== null}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
        />
        <NullifyGatePassDialog
          gatePass={nullifying}
          open={nullifying !== null}
          onOpenChange={(open) => {
            if (!open) setNullifying(null);
          }}
        />
        <DeleteGatePassDialog
          gatePass={deleting}
          open={deleting !== null}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
        />
      </PageCard>
    </div>
  );
}
