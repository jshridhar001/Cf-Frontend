import { CheckIcon, XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDeliveryQuantity } from '@/features/seed-requisition/overview/lib/requested-deliveries';
import {
  formatRequisitionDate,
  formatSeedRequisitionStatus,
  type SeedRequisition,
  type SeedRequisitionDelivery,
} from '@/features/seed-requisition/overview/types';

function statusClass(status: SeedRequisitionDelivery['status']) {
  if (status === 'APPROVED') {
    return 'border-transparent bg-primary/10 text-primary';
  }
  if (status === 'REJECTED') {
    return 'border-transparent bg-destructive/10 text-destructive';
  }
  return 'border-transparent bg-muted text-muted-foreground';
}

export function RequestedDeliveryLines({
  requisition,
  onApprove,
  onReject,
}: {
  requisition: SeedRequisition;
  onApprove: (delivery: SeedRequisitionDelivery) => void;
  onReject: (delivery: SeedRequisitionDelivery) => void;
}) {
  const lines = [...requisition.requestedDeliveries].sort((left, right) =>
    left.deliveryDate.localeCompare(right.deliveryDate),
  );

  if (lines.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Add a delivery before it can be approved.</p>
    );
  }

  return (
    <ul className="flex min-w-52 flex-col gap-2">
      {lines.map((line) => {
        const quantity = formatDeliveryQuantity(line);
        const date = formatRequisitionDate(line.deliveryDate);
        const label = quantity ? `${quantity} · ${date}` : date;
        const canDecide = line.status === 'PENDING' && Boolean(line.id);

        return (
          <li key={line.id ?? line.deliveryDate} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Badge variant="outline" className={statusClass(line.status)}>
                {formatSeedRequisitionStatus(line.status)}
              </Badge>
              {canDecide ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-7"
                    aria-label={`Approve ${label}`}
                    onClick={() => onApprove(line)}
                  >
                    <CheckIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Reject ${label}`}
                    onClick={() => onReject(line)}
                  >
                    <XIcon />
                  </Button>
                </>
              ) : null}
            </div>
            {line.status === 'REJECTED' && line.rejectionRemarks?.trim() ? (
              <p className="text-xs text-muted-foreground">{line.rejectionRemarks.trim()}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
