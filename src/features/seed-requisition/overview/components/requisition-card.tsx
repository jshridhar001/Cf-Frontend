import {
  CalendarDays,
  CheckIcon,
  LandPlot,
  Package,
  Sprout,
  SquarePenIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import type { ComponentProps } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  formatRequestedQuantity,
  formatRequisitionDate,
  formatSeedRequisitionStatus,
  type SeedRequisition,
} from '@/features/seed-requisition/overview/types';
import { cn } from '@/lib/utils';

function RequisitionRow({
  icon: Icon,
  value,
  muted = false,
}: {
  icon: typeof Package;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <p
        className={cn(
          'truncate text-sm',
          muted ? 'text-muted-foreground' : 'font-medium text-foreground',
        )}
      >
        {value}
      </p>
    </div>
  );
}

function CardIconButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(
        'relative size-8 text-muted-foreground after:absolute after:-inset-1.5 after:content-[""] hover:text-foreground sm:after:hidden',
        className,
      )}
      {...props}
    />
  );
}

function statusBadgeClass(status: SeedRequisition['status']) {
  if (status === 'APPROVED') {
    return 'border-primary/25 bg-primary/10 text-primary';
  }
  if (status === 'REJECTED') {
    return 'border-destructive/25 bg-destructive/10 text-destructive';
  }
  return 'border-border bg-muted text-muted-foreground';
}

export function RequisitionCard({
  requisition,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: {
  requisition: SeedRequisition;
  onEdit: (requisition: SeedRequisition) => void;
  onDelete: (requisition: SeedRequisition) => void;
  onApprove: (requisition: SeedRequisition) => void;
  onReject: (requisition: SeedRequisition) => void;
}) {
  const farmerName = requisition.farmer?.name ?? 'Unknown farmer';
  const accountNumber = requisition.farmer?.accountNumber;
  const varietyName = requisition.variety?.name ?? 'Unknown variety';
  const isPending = requisition.status === 'PENDING';

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="pr-2 font-heading text-base font-semibold tracking-tight">
          {farmerName}{' '}
          {accountNumber ? (
            <span className="text-sm font-normal text-muted-foreground">(#{accountNumber})</span>
          ) : null}
        </CardTitle>
        <CardAction>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Package className="size-4 text-primary" aria-hidden />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 px-4">
        <RequisitionRow icon={Sprout} value={varietyName} />
        <RequisitionRow icon={LandPlot} value={formatRequestedQuantity(requisition)} />
        <RequisitionRow
          icon={CalendarDays}
          value={`Requested ${formatRequisitionDate(requisition.requisitionDate)}`}
          muted
        />
        <RequisitionRow
          icon={CalendarDays}
          value={`Delivery ${formatRequisitionDate(requisition.requestedDeliveryDate)}`}
          muted
        />
      </CardContent>

      <Separator className="mx-4" />

      <CardFooter className="justify-between gap-2 px-4">
        <Badge variant="outline" className={statusBadgeClass(requisition.status)}>
          {formatSeedRequisitionStatus(requisition.status)}
        </Badge>
        <div className="flex items-center gap-0.5">
          {isPending ? (
            <>
              <CardIconButton
                aria-label={`Approve requisition for ${farmerName}`}
                onClick={() => onApprove(requisition)}
              >
                <CheckIcon />
              </CardIconButton>
              <CardIconButton
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Reject requisition for ${farmerName}`}
                onClick={() => onReject(requisition)}
              >
                <XIcon />
              </CardIconButton>
            </>
          ) : null}
          <CardIconButton
            aria-label={`Edit requisition for ${farmerName}`}
            onClick={() => onEdit(requisition)}
          >
            <SquarePenIcon />
          </CardIconButton>
          <CardIconButton
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete requisition for ${farmerName}`}
            onClick={() => onDelete(requisition)}
          >
            <Trash2Icon />
          </CardIconButton>
        </div>
      </CardFooter>
    </Card>
  );
}
