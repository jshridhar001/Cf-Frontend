import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { parseDecimal } from '@/features/seed-dispatch/create/lib/quantity';
import {
  formatAwaitingQuantity,
  fulfillmentPercent,
  isAcresBasedSeedRequisition,
  remainingQuantity,
  toQuantityRequisition,
} from '@/features/seed-dispatch/overview/lib/awaiting-requisitions';
import {
  formatRequisitionDate,
  type SeedRequisition,
} from '@/features/seed-requisition/overview/types';

export function AwaitingRequisitionCard({ requisition }: { requisition: SeedRequisition }) {
  const acresBased = isAcresBasedSeedRequisition(requisition);
  const quantity = toQuantityRequisition(requisition);
  const remaining = remainingQuantity(requisition);
  const percent = fulfillmentPercent(requisition);
  const remainingLabel = acresBased
    ? `${formatAwaitingQuantity(remaining)} acres remaining`
    : `${formatAwaitingQuantity(remaining, 0)} seed bags remaining`;

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base font-semibold tracking-tight">
          {requisition.farmer?.name || '—'}
        </CardTitle>
        <p className="text-sm text-muted-foreground tabular-nums">
          {requisition.farmer?.accountNumber ? `#${requisition.farmer.accountNumber}` : '—'}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{requisition.variety?.name || '—'}</span>
          <Badge variant="outline" className="bg-background font-normal">
            {acresBased ? 'Acres' : 'Bags'}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {requisition.approvedDeliveryDate
            ? `Approved delivery ${formatRequisitionDate(requisition.approvedDeliveryDate)}`
            : 'No approved delivery date'}
        </p>
        <p className="tabular-nums">
          {acresBased
            ? `${formatAwaitingQuantity(parseDecimal(requisition.requestedAcres))} acres ordered`
            : `${formatAwaitingQuantity(requisition.requestedBags ?? 0, 0)} seed bags ordered`}
        </p>
        <p className="text-muted-foreground tabular-nums">
          Dispatched {formatAwaitingQuantity(parseDecimal(quantity.fulfilledAcres))} acres ·{' '}
          {formatAwaitingQuantity(parseDecimal(quantity.fulfilledQuantity), 0)} seed bags
        </p>
        {requisition.remarks?.trim() ? (
          <p className="text-muted-foreground">{requisition.remarks.trim()}</p>
        ) : null}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="font-normal tabular-nums">
              {remainingLabel}
            </Badge>
            <span className="tabular-nums text-muted-foreground">{percent}%</span>
          </div>
          <Progress value={percent} className="h-1.5" aria-label={`${percent}% fulfilled`} />
        </div>
      </CardContent>
    </Card>
  );
}
