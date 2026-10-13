import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { TransferLinesList } from '@/features/transfer-stock/components/transfer-lines-list';
import {
  displayOptional,
  formatFarmerLabel,
  formatWeight,
} from '@/features/transfer-stock/lib/format';
import { TransferLifecycleControls } from '@/features/transfer-stock/overview/components/transfer-lifecycle-controls';
import { TransferStatusBadge } from '@/features/transfer-stock/overview/components/transfer-status-badge';
import {
  formatTransferDate,
  type StockTransfer,
  totalTransferBags,
} from '@/features/transfer-stock/overview/types';
import { cn } from '@/lib/utils';

function DetailField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <dt className="text-muted-foreground text-xs font-medium">{label}</dt>
      <dd className="text-foreground text-sm font-semibold">{children}</dd>
    </div>
  );
}

export function TransferStockDetailView({ transfer }: { transfer: StockTransfer }) {
  const bags = totalTransferBags(transfer);
  const average =
    transfer.netWeight != null && transfer.netWeight !== '' && bags > 0
      ? Number(transfer.netWeight) / bags
      : null;

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2 w-fit"
          asChild
        >
          <Link to="/transfer-stock">
            <ArrowLeft className="size-4" />
            Back to overview
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <TransferStatusBadge status={transfer.status} />
          <TransferLifecycleControls transfer={transfer} variant="buttons" />
        </div>
      </div>

      <PageCard className="border-border/50 min-w-0 shadow-sm">
        <PageCardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <ArrowLeftRight className="size-4" aria-hidden />
            </span>
            Transfer details
          </CardTitle>
          <CardDescription className="hidden sm:block">
            Truck {transfer.truckNumber?.trim() || '—'} · {transfer.toLocation}
          </CardDescription>
        </PageCardHeader>
        <PageCardContent className="flex flex-col gap-8">
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label="From">{formatFarmerLabel(transfer.fromFarmer)}</DetailField>
            <DetailField label="To">{formatFarmerLabel(transfer.toFarmer)}</DetailField>
            <DetailField label="Transfer date">
              {formatTransferDate(transfer.transferDate ?? transfer.createdAt)}
            </DetailField>
            <DetailField label="Received on">{formatTransferDate(transfer.receivedAt)}</DetailField>
            <DetailField label="Truck number">{transfer.truckNumber?.trim() || '—'}</DetailField>
            <DetailField label="Destination">{transfer.toLocation}</DetailField>
            <DetailField label="Manual gate pass">
              {displayOptional(transfer.manualGatePassNumber)}
            </DetailField>
            <DetailField label="Weight slip">
              {displayOptional(transfer.weightSlipNumber)}
            </DetailField>
            <DetailField label="Driver mobile">
              {displayOptional(transfer.driverMobile)}
            </DetailField>
            <DetailField label="Gross weight (kg)">
              {formatWeight(transfer.grossWeight)}
            </DetailField>
            <DetailField label="Tare weight (kg)">{formatWeight(transfer.tareWeight)}</DetailField>
            <DetailField label="Net weight (kg)">{formatWeight(transfer.netWeight)}</DetailField>
            <DetailField label="Avg kg / bag">
              {average != null && Number.isFinite(average) ? formatWeight(average) : '—'}
            </DetailField>
            <DetailField label="Total seed bags">{bags}</DetailField>
            {transfer.remarks ? (
              <DetailField label="Remarks" className="sm:col-span-2 lg:col-span-3">
                {transfer.remarks}
              </DetailField>
            ) : null}
          </dl>

          <section className="flex flex-col gap-3">
            <p className="text-sm font-medium">Bags</p>
            <TransferLinesList
              lines={transfer.lines.map((line) => ({
                key: line.id,
                varietyName: line.variety.name,
                sizeName: line.size.name,
                generationName: line.generation.name,
                bagQuantity: line.bagQuantity,
              }))}
            />
          </section>
        </PageCardContent>
      </PageCard>
    </div>
  );
}
