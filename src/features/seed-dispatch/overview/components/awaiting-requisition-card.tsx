import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  type AwaitingDeliveryLot,
  formatAwaitingQuantity,
} from '@/features/seed-dispatch/overview/lib/awaiting-requisitions';
import { formatRequisitionDate } from '@/features/seed-requisition/overview/types';

function quantityLabel(lot: AwaitingDeliveryLot, value: number) {
  return lot.isAcresBased
    ? `${formatAwaitingQuantity(value)} acres`
    : `${formatAwaitingQuantity(value, 0)} seed bags`;
}

export function AwaitingRequisitionCard({ lot }: { lot: AwaitingDeliveryLot }) {
  const remainingLabel = lot.isAcresBased
    ? `${formatAwaitingQuantity(lot.remainingQuantity)} acres remaining`
    : `${formatAwaitingQuantity(lot.remainingQuantity, 0)} seed bags remaining`;

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base font-semibold tracking-tight">
          {lot.farmerName || '—'}
        </CardTitle>
        <p className="text-sm text-muted-foreground tabular-nums">
          {lot.accountNumber ? `#${lot.accountNumber}` : '—'}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{lot.varietyName || '—'}</span>
          <Badge variant="outline" className="bg-background font-normal">
            {lot.isAcresBased ? 'Acres' : 'Bags'}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Approved delivery {formatRequisitionDate(lot.deliveryDate)}
        </p>
        <p className="tabular-nums">
          {lot.isAcresBased
            ? `${formatAwaitingQuantity(lot.approvedQuantity)} acres ordered`
            : `${formatAwaitingQuantity(lot.approvedQuantity, 0)} seed bags ordered`}
        </p>
        <p className="text-muted-foreground tabular-nums">
          Dispatched {quantityLabel(lot, lot.dispatchedQuantity)}
        </p>
        {lot.remarks?.trim() ? <p className="text-muted-foreground">{lot.remarks.trim()}</p> : null}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="font-normal tabular-nums">
              {remainingLabel}
            </Badge>
            <span className="tabular-nums text-muted-foreground">{lot.fulfillmentPercent}%</span>
          </div>
          <Progress
            value={lot.fulfillmentPercent}
            className="h-1.5"
            aria-label={`${lot.fulfillmentPercent}% fulfilled`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
