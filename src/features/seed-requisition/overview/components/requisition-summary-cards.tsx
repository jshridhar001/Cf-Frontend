import { CheckCircle2, Clock, Sprout, XCircle } from 'lucide-react';
import type { ComponentType } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  formatSummaryAcres,
  formatSummaryCount,
  type RequisitionOverviewSummary,
} from '@/features/seed-requisition/overview/lib/summary';
import type { SeedRequisitionStatus } from '@/features/seed-requisition/overview/types';
import { cn } from '@/lib/utils';

type SummaryCardKey = 'total' | SeedRequisitionStatus;

const CARDS: Array<{
  key: SummaryCardKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
  iconClass: string;
  ringClass: string;
  selectedClass: string;
}> = [
  {
    key: 'total',
    label: 'Total',
    icon: Sprout,
    iconClass: 'bg-muted text-muted-foreground',
    ringClass: 'ring-border/80',
    selectedClass: 'bg-muted/40 ring-foreground/20',
  },
  {
    key: 'PENDING',
    label: 'Pending',
    icon: Clock,
    iconClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    ringClass: 'ring-amber-500/25',
    selectedClass: 'bg-amber-500/5 ring-amber-500/50',
  },
  {
    key: 'APPROVED',
    label: 'Approved',
    icon: CheckCircle2,
    iconClass: 'bg-primary/10 text-primary',
    ringClass: 'ring-primary/25',
    selectedClass: 'bg-primary/5 ring-primary/50',
  },
  {
    key: 'REJECTED',
    label: 'Rejected',
    icon: XCircle,
    iconClass: 'bg-destructive/10 text-destructive',
    ringClass: 'ring-destructive/25',
    selectedClass: 'bg-destructive/5 ring-destructive/50',
  },
];

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium tabular-nums">{value}</p>
    </div>
  );
}

export function RequisitionSummaryCards({
  summary,
  selectedStatus,
  onSelect,
}: {
  summary: RequisitionOverviewSummary;
  selectedStatus: SeedRequisitionStatus | undefined;
  onSelect: (status: SeedRequisitionStatus | undefined) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const quantities = summary[card.key];
        const selected =
          card.key === 'total' ? selectedStatus === undefined : selectedStatus === card.key;

        return (
          <Card
            key={card.key}
            className={cn(
              'gap-0 rounded-xl py-0 shadow-none ring-1',
              card.ringClass,
              selected && card.selectedClass,
            )}
          >
            <button
              type="button"
              aria-pressed={selected}
              aria-label={`${card.label}: ${formatSummaryCount(quantities.count)} requisitions`}
              className="flex min-h-11 w-full flex-col gap-2 p-3 text-left"
              onClick={() => {
                if (card.key === 'total') {
                  onSelect(undefined);
                  return;
                }
                onSelect(selected ? undefined : card.key);
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <small className="text-sm leading-none font-medium tracking-wide text-muted-foreground uppercase">
                  {card.label}
                </small>
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full',
                    card.iconClass,
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                </span>
              </div>
              <p className="scroll-m-20 text-2xl font-semibold tracking-tight tabular-nums">
                {formatSummaryCount(quantities.count)}
              </p>
              <Separator />
              <div className="grid grid-cols-2 gap-2">
                <Metric label="Acres" value={formatSummaryAcres(quantities.acres)} />
                <Metric label="Seed bags" value={formatSummaryCount(quantities.bags)} />
              </div>
            </button>
          </Card>
        );
      })}
    </div>
  );
}
