import { Link } from '@tanstack/react-router';
import { ArrowLeft, Package, Truck } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { round2 } from '@/features/seed-dispatch/create/lib/quantity';
import { DispatchLotsTable } from '@/features/seed-dispatch/detail/components/dispatch-lots-table';
import {
  getDeliveredOn,
  getFarmersReceived,
  getTotalBags,
} from '@/features/seed-dispatch/overview/lib/derived';
import {
  formatDispatchDate,
  formatSeedDispatchStatus,
  type SeedDispatch,
} from '@/features/seed-dispatch/overview/types';
import { formatSeedSize } from '@/lib/format-seed-size';
import { cn } from '@/lib/utils';

type DetailFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

function DetailField({ label, children, className }: DetailFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold text-foreground">{children}</dd>
    </div>
  );
}

function displayOptional(value: string | number | null | undefined) {
  if (value == null || value === '') return '—';
  return String(value);
}

const weightFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
});

function displayWeight(value: string | null | undefined) {
  if (value == null || value === '') return '—';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
  return weightFormatter.format(amount);
}

function statusBadgeClass(status: SeedDispatch['status']) {
  if (status === 'DELIVERED') {
    return 'border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  }
  if (status === 'IN_TRANSIT') {
    return 'border-transparent bg-primary/10 text-primary';
  }
  return 'border-transparent bg-muted text-muted-foreground';
}

type ExtractionRow = {
  facilityName: string;
  varietyName: string;
  generationName: string;
  sizeName: string;
  quantity: number;
};

function extractionRows(dispatch: SeedDispatch): ExtractionRow[] {
  const rows = new Map<string, ExtractionRow>();

  for (const lot of dispatch.dispatchRequisitions) {
    const varietyName = lot.requisition.variety.name;
    for (const line of lot.sizeLines) {
      const facilityName = line.facility.name;
      const generationName = line.generation.name;
      const sizeName = line.size.name;
      const key = [facilityName, varietyName, generationName, sizeName].join('::');
      const existing = rows.get(key);
      if (existing) {
        existing.quantity += line.bagQuantity;
      } else {
        rows.set(key, {
          facilityName,
          varietyName,
          generationName,
          sizeName,
          quantity: line.bagQuantity,
        });
      }
    }
  }

  return Array.from(rows.values()).sort((a, b) => {
    const facilityCompare = a.facilityName.localeCompare(b.facilityName);
    if (facilityCompare !== 0) return facilityCompare;
    const varietyCompare = a.varietyName.localeCompare(b.varietyName);
    if (varietyCompare !== 0) return varietyCompare;
    const generationCompare = a.generationName.localeCompare(b.generationName);
    if (generationCompare !== 0) return generationCompare;
    return a.sizeName.localeCompare(b.sizeName);
  });
}

function averageWeightPerBag(dispatch: SeedDispatch, seedBags: number) {
  if (dispatch.netWeight == null || dispatch.netWeight === '' || seedBags <= 0) return null;
  const net = Number(dispatch.netWeight);
  if (!Number.isFinite(net)) return null;
  return round2(net / seedBags);
}

export function SeedDispatchDetailView({ dispatch }: { dispatch: SeedDispatch }) {
  const rows = extractionRows(dispatch);
  const seedBags = getTotalBags(dispatch);
  const farmers = getFarmersReceived(dispatch);
  const deliveredOn =
    dispatch.status === 'DELIVERED' ? (getDeliveredOn(dispatch) ?? dispatch.updatedAt) : null;
  const average = averageWeightPerBag(dispatch, seedBags);
  const truck = dispatch.truckNumber?.trim() || '—';

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link to="/seed-dispatches/overview">
            <ArrowLeft className="size-4" />
            Back to overview
          </Link>
        </Button>

        <Badge
          variant="outline"
          className={cn('w-fit font-medium', statusBadgeClass(dispatch.status))}
        >
          {formatSeedDispatchStatus(dispatch.status)}
        </Badge>
      </div>

      <PageCard className="min-w-0 border-border/50 shadow-sm">
        <PageCardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Truck className="size-4" aria-hidden />
                </span>
                Dispatch details
              </CardTitle>
              <CardDescription className="hidden sm:block">
                Truck {truck} · {dispatch.toLocation}
              </CardDescription>
            </div>
            <div className="w-full max-w-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Lots received</span>
                <span className="font-medium tabular-nums">
                  {farmers.received} of {farmers.total}
                </span>
              </div>
              <Progress value={farmers.percent} className="h-2" />
            </div>
          </div>
        </PageCardHeader>
        <PageCardContent>
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label="Dispatch date">
              {formatDispatchDate(dispatch.dispatchDate)}
            </DetailField>
            <DetailField label="Delivered on">{formatDispatchDate(deliveredOn)}</DetailField>
            <DetailField label="Truck number">{truck}</DetailField>
            <DetailField label="Manual Gate Pass Number">
              {displayOptional(dispatch.manualGatePassNumber)}
            </DetailField>
            <DetailField label="Weight slip">
              {displayOptional(dispatch.weightSlipNumber)}
            </DetailField>
            <DetailField label="Driver mobile">
              {displayOptional(dispatch.driverMobile)}
            </DetailField>
            <DetailField label="Destination">{dispatch.toLocation}</DetailField>
            <DetailField label="Gross weight (kg)">
              {displayWeight(dispatch.grossWeight)}
            </DetailField>
            <DetailField label="Tare weight (kg)">{displayWeight(dispatch.tareWeight)}</DetailField>
            <DetailField label="Net weight (kg)">{displayWeight(dispatch.netWeight)}</DetailField>
            <DetailField label="Avg kg / bag">{displayOptional(average)}</DetailField>
            <DetailField label="Total seed bags">{seedBags}</DetailField>
            <DetailField label="Seed Bags From Facility" className="sm:col-span-2 lg:col-span-3">
              {rows.length === 0 ? (
                '—'
              ) : (
                <>
                  <ItemGroup className="mt-1 md:hidden">
                    {rows.map((row) => (
                      <Item
                        key={[
                          row.facilityName,
                          row.varietyName,
                          row.generationName,
                          row.sizeName,
                        ].join('::')}
                        variant="outline"
                      >
                        <ItemContent>
                          <ItemTitle>{row.facilityName}</ItemTitle>
                          <ItemDescription>
                            {row.varietyName} · {row.generationName} ·{' '}
                            {formatSeedSize(row.sizeName)}
                          </ItemDescription>
                          <ItemDescription className="tabular-nums">
                            {row.quantity} bags
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    ))}
                  </ItemGroup>
                  <div className="mt-1 hidden overflow-hidden rounded-md border md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead>Cold storage</TableHead>
                          <TableHead>Variety</TableHead>
                          <TableHead>Generation</TableHead>
                          <TableHead>Size / grading</TableHead>
                          <TableHead className="text-right">Quantity (bags)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow
                            key={[
                              row.facilityName,
                              row.varietyName,
                              row.generationName,
                              row.sizeName,
                            ].join('::')}
                          >
                            <TableCell>{row.facilityName}</TableCell>
                            <TableCell>{row.varietyName}</TableCell>
                            <TableCell>{row.generationName}</TableCell>
                            <TableCell>{formatSeedSize(row.sizeName)}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {row.quantity}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </DetailField>
            <DetailField label="Remarks" className="sm:col-span-2 lg:col-span-3">
              {displayOptional(dispatch.remarks)}
            </DetailField>
          </dl>
        </PageCardContent>
      </PageCard>

      <PageCard className="min-w-0 border-border/50 shadow-sm">
        <PageCardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="size-4" aria-hidden />
            </span>
            Lots
          </CardTitle>
          <CardDescription className="hidden sm:block">
            Receive each farmer lot with an OTP confirmation.
          </CardDescription>
        </PageCardHeader>
        <PageCardContent>
          <DispatchLotsTable
            dispatchId={dispatch.id}
            dispatchStatus={dispatch.status}
            lots={dispatch.dispatchRequisitions}
          />
        </PageCardContent>
      </PageCard>
    </div>
  );
}
