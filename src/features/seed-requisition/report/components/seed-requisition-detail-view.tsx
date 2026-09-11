import { Link } from '@tanstack/react-router';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SeedRequisitionDetail } from '@/features/seed-requisition/report/types';
import { formatDate, formatDateTime } from '@/lib/format-date';
import { cn } from '@/lib/utils';

import { RemarksPill } from './remarks-pill';
import { SeedRequisitionDetailActions } from './seed-requisition-detail-actions';
import { SeedRequisitionLifecycle } from './seed-requisition-lifecycle';

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

function displayQuantity(value: number): string {
  return value > 0 ? String(value) : '—';
}

const STATUS_BADGE_CLASS = {
  approved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  rejected: 'bg-destructive/10 text-destructive',
} as const;

const STATUS_LABEL = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
} as const;

type SeedRequisitionDetailViewProps = {
  requisition: SeedRequisitionDetail;
};

export function SeedRequisitionDetailView({ requisition }: SeedRequisitionDetailViewProps) {
  const reviewedBy =
    requisition.status === 'approved'
      ? requisition.approvedByName
      : requisition.status === 'rejected'
        ? requisition.rejectedByName
        : null;

  const reviewDateLabel = requisition.status === 'rejected' ? 'Rejection date' : 'Approval date';
  const reviewDateValue =
    requisition.status === 'rejected'
      ? requisition.rejectedAt
        ? formatDateTime(requisition.rejectedAt)
        : '—'
      : requisition.status === 'approved'
        ? requisition.approvedAt
          ? formatDateTime(requisition.approvedAt)
          : '—'
        : '—';

  const createdByValue = requisition.createdByName
    ? `${requisition.createdByName} on ${formatDateTime(requisition.createdAt)}`
    : formatDateTime(requisition.createdAt);

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2 w-fit"
          asChild
        >
          <Link to="/seed-requisition/report">
            <ArrowLeft className="size-4" />
            Back to report
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Badge
            variant="outline"
            className={cn('border-transparent font-medium', STATUS_BADGE_CLASS[requisition.status])}
          >
            {STATUS_LABEL[requisition.status]}
          </Badge>
          <SeedRequisitionDetailActions requisition={requisition} />
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(240px,320px)_1fr] lg:gap-6">
        <SeedRequisitionLifecycle requisition={requisition} />

        <Card className="border-border/50 min-w-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                <ClipboardList className="size-4" aria-hidden />
              </span>
              Requisition details
            </CardTitle>
            <CardDescription>Farmer, variety, dates, and audit information</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <DetailField label="Farmer">{requisition.farmer}</DetailField>
              <DetailField label="Variety">{requisition.variety}</DetailField>

              <DetailField label="Requisition date">
                {formatDate(requisition.requisitionDate)}
              </DetailField>
              <DetailField label="Requested delivery">
                {formatDate(requisition.requestedDeliveryDate)}
              </DetailField>
              <DetailField label="Approved delivery">
                {formatDate(requisition.approvedDelivery)}
              </DetailField>

              <DetailField label="Acres">{displayQuantity(requisition.acres)}</DetailField>
              <DetailField label="Seed Bags">{displayQuantity(requisition.seedBags)}</DetailField>

              <DetailField label="Remarks" className="sm:col-span-2">
                <RemarksPill remarks={requisition.remarks} />
              </DetailField>

              <DetailField label="Created by">{createdByValue}</DetailField>
              <DetailField label="Reviewed by">{reviewedBy ?? '—'}</DetailField>
              <DetailField label={reviewDateLabel}>{reviewDateValue}</DetailField>

              {requisition.status === 'rejected' && requisition.rejectionRemarks ? (
                <DetailField label="Rejection remarks" className="sm:col-span-2">
                  <span className="text-destructive/90 font-normal italic">
                    {requisition.rejectionRemarks}
                  </span>
                </DetailField>
              ) : null}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
