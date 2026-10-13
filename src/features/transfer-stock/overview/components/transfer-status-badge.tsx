import { Badge } from '@/components/ui/badge';
import {
  formatStockTransferStatus,
  isStockTransferStatus,
} from '@/features/transfer-stock/overview/types';
import { cn } from '@/lib/utils';

function statusBadgeClass(status: string) {
  if (status === 'RECEIVED') {
    return 'border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  }
  if (status === 'PENDING') {
    return 'border-transparent bg-primary/10 text-primary';
  }
  return 'border-transparent bg-muted text-muted-foreground';
}

export function TransferStatusBadge({ status }: { status: string }) {
  const label = isStockTransferStatus(status) ? formatStockTransferStatus(status) : status;

  return (
    <Badge variant="outline" className={cn('font-medium', statusBadgeClass(status))}>
      {label}
    </Badge>
  );
}
