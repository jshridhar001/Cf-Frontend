import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Package, Truck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SeedDispatchDetail } from '@/features/seed-dispatch/types';
import { formatDate } from '@/lib/format-date';
import { formatSeedSize } from '@/lib/format-seed-size';
import { cn } from '@/lib/utils';

import { DispatchLotsTable } from './dispatch-lots-table';

type DetailFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

function DetailField({ label, children, className }: DetailFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <dt className="text-muted-foreground text-xs font-medium">{label}</dt>
      <dd className="text-foreground text-sm font-semibold">{children}</dd>
    </div>
  );
}

function displayOptional(value: string | number | null | undefined) {
  if (value == null || value === '') return '—';
  return String(value);
}

type SeedDispatchDetailViewProps = {
  dispatch: SeedDispatchDetail;
};

export function SeedDispatchDetailView({ dispatch }: SeedDispatchDetailViewProps) {
  const extractionRows = Array.from(
    dispatch.lots
      .flatMap((lot) =>
        lot.sizeLines.map((line) => ({
          facilityName: line.facilityName,
          varietyName: lot.varietyName,
          generationName: line.generationName,
          sizeName: line.sizeName,
          quantity: line.quantity,
        })),
      )
      .reduce(
        (map, row) => {
          const key = [row.facilityName, row.varietyName, row.generationName, row.sizeName].join(
            '::',
          );
          const existing = map.get(key);
          if (existing) {
            existing.quantity += row.quantity;
          } else {
            map.set(key, { ...row });
          }
          return map;
        },
        new Map<
          string,
          {
            facilityName: string;
            varietyName: string;
            generationName: string;
            sizeName: string;
            quantity: number;
          }
        >(),
      )
      .values(),
  ).sort((a, b) => {
    const facilityCompare = a.facilityName.localeCompare(b.facilityName);
    if (facilityCompare !== 0) return facilityCompare;
    const varietyCompare = a.varietyName.localeCompare(b.varietyName);
    if (varietyCompare !== 0) return varietyCompare;
    const generationCompare = a.generationName.localeCompare(b.generationName);
    if (generationCompare !== 0) return generationCompare;
    return a.sizeName.localeCompare(b.sizeName);
  });

  const progressPercent =
    dispatch.progress.total === 0
      ? 0
      : Math.round((dispatch.progress.received / dispatch.progress.total) * 100);

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2 w-fit"
          asChild
        >
          <Link to="/seed-dispatches/overview">
            <ArrowLeft className="size-4" />
            Back to overview
          </Link>
        </Button>

        <Badge
          variant="outline"
          className={cn(
            'border-transparent font-medium',
            dispatch.status === 'delivered' &&
              'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
            dispatch.status === 'delivering' && 'bg-primary/10 text-primary',
            dispatch.status === 'null' && 'bg-muted text-muted-foreground',
          )}
        >
          {dispatch.status === 'delivered'
            ? 'Delivered'
            : dispatch.status === 'null'
              ? 'Null'
              : 'In Transit'}
        </Badge>
      </div>

      <Card className="border-border/50 min-w-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                  <Truck className="size-4" aria-hidden />
                </span>
                Dispatch details
              </CardTitle>
              <CardDescription>
                Truck {dispatch.truckNumber} · {dispatch.destination}
              </CardDescription>
            </div>
            <div className="w-full max-w-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Lots received</span>
                <span className="font-medium tabular-nums">
                  {dispatch.progress.received} of {dispatch.progress.total}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label="Dispatch date">
              {dispatch.dispatchDate ? formatDate(dispatch.dispatchDate) : '—'}
            </DetailField>
            <DetailField label="Delivered on">
              {dispatch.deliveredOn ? formatDate(dispatch.deliveredOn) : '—'}
            </DetailField>
            <DetailField label="Truck number">{dispatch.truckNumber}</DetailField>
            <DetailField label="Manual Gate Pass Number">
              {displayOptional(dispatch.manualGatePassNumber)}
            </DetailField>
            <DetailField label="Weight slip">
              {displayOptional(dispatch.weightSlipNumber)}
            </DetailField>
            <DetailField label="Driver mobile">
              {displayOptional(dispatch.driverMobile)}
            </DetailField>
            <DetailField label="Destination">{dispatch.destination}</DetailField>
            <DetailField label="Gross weight (kg)">
              {displayOptional(dispatch.grossWeight)}
            </DetailField>
            <DetailField label="Tare weight (kg)">
              {displayOptional(dispatch.tareWeight)}
            </DetailField>
            <DetailField label="Net weight (kg)">
              {displayOptional(dispatch.netWeightKg)}
            </DetailField>
            <DetailField label="Avg kg / bag">
              {displayOptional(dispatch.averageWeightPerBag)}
            </DetailField>
            <DetailField label="Total seed bags">{dispatch.seedBags}</DetailField>
            <DetailField label="Seed Bags From Facility" className="sm:col-span-2 lg:col-span-3">
              {extractionRows.length === 0 ? (
                '—'
              ) : (
                <div className="mt-1 overflow-hidden rounded-md border">
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
                      {extractionRows.map((row) => (
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
                          <TableCell className="text-right tabular-nums">{row.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DetailField>
            <DetailField label="Remarks" className="sm:col-span-2 lg:col-span-3">
              {displayOptional(dispatch.remarks)}
            </DetailField>
          </dl>
        </CardContent>
      </Card>

      <Card className="border-border/50 min-w-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <Package className="size-4" aria-hidden />
            </span>
            Lots
          </CardTitle>
          <CardDescription>Receive each farmer lot with an OTP confirmation.</CardDescription>
        </CardHeader>
        <CardContent>
          <DispatchLotsTable dispatch={dispatch} />
        </CardContent>
      </Card>
    </div>
  );
}
