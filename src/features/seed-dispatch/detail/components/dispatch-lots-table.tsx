import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DispatchLotReceiptDialog } from '@/features/seed-dispatch/detail/components/dispatch-lot-receipt-dialog';
import {
  formatDispatchDate,
  type SeedDispatch,
  type SeedDispatchRequisition,
} from '@/features/seed-dispatch/overview/types';
import { formatSeedSize } from '@/lib/format-seed-size';

function isReceived(lot: SeedDispatchRequisition) {
  return lot.status === 'RECEIVED';
}

function lotBagTotal(lot: SeedDispatchRequisition) {
  return lot.sizeLines.reduce((sum, line) => sum + line.bagQuantity, 0);
}

function sizeLineSummary(lot: SeedDispatchRequisition) {
  if (lot.sizeLines.length === 0) return null;
  return lot.sizeLines
    .map(
      (line) =>
        `${line.facility.name} · ${line.generation.name} · ${formatSeedSize(line.size.name)} · ${line.bagQuantity}`,
    )
    .join(' · ');
}

function LotStatus({ lot }: { lot: SeedDispatchRequisition }) {
  if (isReceived(lot)) {
    return (
      <div className="flex flex-col gap-1">
        <Badge
          variant="outline"
          className="border-transparent bg-emerald-500/10 font-medium text-emerald-700 dark:text-emerald-400"
        >
          Received
        </Badge>
        {lot.receivedAt ? (
          <span className="text-xs text-muted-foreground">
            {formatDispatchDate(lot.receivedAt)}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-transparent bg-amber-500/10 font-medium text-amber-700 dark:text-amber-400"
    >
      Pending
    </Badge>
  );
}

function LotIdentity({ lot }: { lot: SeedDispatchRequisition }) {
  const farmer = lot.requisition.farmer;
  const summary = sizeLineSummary(lot);

  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium">{farmer.name}</span>
      <span className="text-xs text-muted-foreground">
        #{farmer.accountNumber} · {farmer.mobileNumber}
      </span>
      {summary ? (
        <span className="line-clamp-2 text-xs text-muted-foreground">{summary}</span>
      ) : null}
    </div>
  );
}

function canReceiveLot(lot: SeedDispatchRequisition, dispatchStatus: SeedDispatch['status']) {
  return lot.status === 'PENDING' && dispatchStatus === 'IN_TRANSIT';
}

export function DispatchLotsTable({
  dispatchId,
  dispatchStatus,
  lots,
}: {
  dispatchId: string;
  dispatchStatus: SeedDispatch['status'];
  lots: SeedDispatchRequisition[];
}) {
  const [activeLot, setActiveLot] = useState<SeedDispatchRequisition | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openReceive(lot: SeedDispatchRequisition) {
    setActiveLot(lot);
    setDialogOpen(true);
  }

  if (lots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        No lots on this dispatch.
      </div>
    );
  }

  return (
    <>
      <ItemGroup className="md:hidden">
        {lots.map((lot) => (
          <Item key={lot.id} variant="outline">
            <ItemHeader>
              <ItemTitle>{lot.requisition.farmer.name}</ItemTitle>
              <LotStatus lot={lot} />
            </ItemHeader>
            <ItemContent>
              <ItemDescription>
                #{lot.requisition.farmer.accountNumber} · {lot.requisition.farmer.mobileNumber}
              </ItemDescription>
              <ItemDescription>{lot.requisition.variety.name}</ItemDescription>
              <ItemDescription className="tabular-nums">{lotBagTotal(lot)} bags</ItemDescription>
              {sizeLineSummary(lot) ? (
                <ItemDescription className="line-clamp-3">{sizeLineSummary(lot)}</ItemDescription>
              ) : null}
            </ItemContent>
            {canReceiveLot(lot, dispatchStatus) ? (
              <ItemFooter>
                <Button
                  type="button"
                  size="sm"
                  className="min-h-11"
                  onClick={() => openReceive(lot)}
                >
                  Receive
                </Button>
              </ItemFooter>
            ) : null}
          </Item>
        ))}
      </ItemGroup>

      <div className="hidden overflow-hidden rounded-md border md:block">
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
            {lots.map((lot) => (
              <TableRow key={lot.id}>
                <TableCell>
                  <LotIdentity lot={lot} />
                </TableCell>
                <TableCell>{lot.requisition.variety.name}</TableCell>
                <TableCell className="text-right tabular-nums">{lotBagTotal(lot)}</TableCell>
                <TableCell>
                  <LotStatus lot={lot} />
                </TableCell>
                <TableCell className="text-right">
                  {canReceiveLot(lot, dispatchStatus) ? (
                    <Button type="button" size="sm" onClick={() => openReceive(lot)}>
                      Receive
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DispatchLotReceiptDialog
        lot={activeLot}
        dispatchId={dispatchId}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setActiveLot(null);
        }}
      />
    </>
  );
}
