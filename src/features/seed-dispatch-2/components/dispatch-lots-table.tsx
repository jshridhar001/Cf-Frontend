import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { canReceiveLot } from '@/features/seed-dispatch/lib/lot-status';
import type { SeedDispatchDetail, SeedDispatchLot } from '@/features/seed-dispatch/types';
import { formatDateTime } from '@/lib/format-date';
import { formatSeedSize } from '@/lib/format-seed-size';

import { DispatchLotReceiptDialog } from './dispatch-lot-receipt-dialog';

type DispatchLotsTableProps = {
  dispatch: SeedDispatchDetail;
};

export function DispatchLotsTable({ dispatch }: DispatchLotsTableProps) {
  const [activeLot, setActiveLot] = useState<SeedDispatchLot | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const dispatchStatus =
    dispatch.status === 'delivered'
      ? 'DELIVERED'
      : dispatch.status === 'null'
        ? 'NULL'
        : 'DELIVERING';

  function openReceive(lot: SeedDispatchLot) {
    setActiveLot(lot);
    setDialogOpen(true);
  }

  return (
    <>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Farmer</TableHead>
              <TableHead>Variety</TableHead>
              <TableHead className="text-right">Bags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dispatch.lots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                  No lots on this dispatch.
                </TableCell>
              </TableRow>
            ) : (
              dispatch.lots.map((lot) => {
                const receivable = canReceiveLot({
                  lotStatus: lot.status,
                  dispatchStatus,
                });

                return (
                  <TableRow key={lot.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{lot.farmerName}</span>
                        <span className="text-muted-foreground text-xs">
                          #{lot.farmerAccountNumber} · {lot.mobileNumber}
                        </span>
                        {lot.sizeLines.length > 0 ? (
                          <span className="text-muted-foreground line-clamp-2 text-xs">
                            {lot.sizeLines
                              .map(
                                (line) =>
                                  `${line.facilityName} · ${line.generationName} · ${formatSeedSize(line.sizeName)} · ${line.quantity}`,
                              )
                              .join(' · ')}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{lot.varietyName}</TableCell>
                    <TableCell className="text-right tabular-nums">{lot.bagTotal}</TableCell>
                    <TableCell>
                      {lot.status === 'RECEIVED' ? (
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className="border-transparent bg-emerald-500/10 font-medium text-emerald-700 dark:text-emerald-400"
                          >
                            Received
                          </Badge>
                          {lot.receivedAt ? (
                            <span className="text-muted-foreground text-xs">
                              {formatDateTime(lot.receivedAt)}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-transparent bg-amber-500/10 font-medium text-amber-700 dark:text-amber-400"
                        >
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {receivable ? (
                        <Button type="button" size="sm" onClick={() => openReceive(lot)}>
                          Receive
                        </Button>
                      ) : lot.status === 'RECEIVED' ? (
                        <span className="text-muted-foreground text-xs">—</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Dispatch closed</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DispatchLotReceiptDialog
        lot={activeLot}
        dispatchId={dispatch.id}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setActiveLot(null);
        }}
      />
    </>
  );
}
