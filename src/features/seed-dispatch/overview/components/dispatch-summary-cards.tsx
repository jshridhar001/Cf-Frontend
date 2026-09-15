import { CheckCircle2, Clock, Layers, Truck } from 'lucide-react';
import type { ComponentType } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  formatSummaryAcres,
  formatSummaryCount,
  type DispatchOverviewSummary,
} from '@/features/seed-dispatch/overview/lib/summary';
import type { SeedDispatchStatus } from '@/features/seed-dispatch/overview/types';
import { cn } from '@/lib/utils';

type SummaryCardKey = 'total' | SeedDispatchStatus;

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
    icon: Layers,
    iconClass: 'bg-muted text-muted-foreground',
    ringClass: 'ring-border/80',
    selectedClass: 'bg-muted/40 ring-foreground/20',
  },
  {
    key: 'IN_TRANSIT',
    label: 'In Transit',
    icon: Truck,
    iconClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    ringClass: 'ring-sky-500/25',
    selectedClass: 'bg-sky-500/5 ring-sky-500/50',
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    icon: CheckCircle2,
    iconClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    ringClass: 'ring-emerald-500/25',
    selectedClass: 'bg-emerald-500/5 ring-emerald-500/50',
  },
  {
    key: 'AWAITING_DISPATCH',
    label: 'Awaiting Dispatch',
    icon: Clock,
    iconClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    ringClass: 'ring-amber-500/25',
    selectedClass: 'bg-amber-500/5 ring-amber-500/50',
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

export function DispatchSummaryCards({
  summary,
  selectedStatus,
  onSelect,
}: {
  summary: DispatchOverviewSummary;
  selectedStatus: SeedDispatchStatus | undefined;
  onSelect: (status: SeedDispatchStatus | undefined) => void;
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
              aria-label={`${card.label}: ${formatSummaryCount(quantities.count)} dispatches`}
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
