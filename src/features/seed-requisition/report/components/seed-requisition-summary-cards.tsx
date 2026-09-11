import { Boxes, CheckCircle2, Clock3, type LucideIcon, XCircle } from 'lucide-react';
import type {
  SeedRequisitionRow,
  SeedRequisitionStatus,
} from '@/features/seed-requisition/report/types';
import { cn } from '@/lib/utils';

type SummaryKey = 'total' | SeedRequisitionStatus;

type SummaryStat = {
  key: SummaryKey;
  label: string;
  icon: LucideIcon;
  count: number;
  acres: number;
  seedBags: number;
  tone: string;
  iconTone: string;
};

function summarize(
  rows: SeedRequisitionRow[],
  status?: SeedRequisitionStatus,
): Omit<SummaryStat, 'key' | 'label' | 'icon' | 'tone' | 'iconTone'> {
  const subset = status ? rows.filter((row) => row.status === status) : rows;
  return {
    count: subset.length,
    acres: subset.reduce((sum, row) => sum + (row.acres || 0), 0),
    seedBags: subset.reduce((sum, row) => sum + (row.seedBags || 0), 0),
  };
}

function formatAcres(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(value);
}

type SeedRequisitionSummaryCardsProps = {
  data: SeedRequisitionRow[];
  className?: string;
};

export function SeedRequisitionSummaryCards({ data, className }: SeedRequisitionSummaryCardsProps) {
  const cards: SummaryStat[] = [
    {
      key: 'total',
      label: 'Total',
      icon: Boxes,
      tone: 'border-border/50',
      iconTone: 'bg-muted text-muted-foreground',
      ...summarize(data),
    },
    {
      key: 'pending',
      label: 'Pending',
      icon: Clock3,
      tone: 'border-amber-500/20',
      iconTone: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      ...summarize(data, 'pending'),
    },
    {
      key: 'approved',
      label: 'Approved',
      icon: CheckCircle2,
      tone: 'border-emerald-500/20',
      iconTone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      ...summarize(data, 'approved'),
    },
    {
      key: 'rejected',
      label: 'Rejected',
      icon: XCircle,
      tone: 'border-destructive/20',
      iconTone: 'bg-destructive/10 text-destructive',
      ...summarize(data, 'rejected'),
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 gap-3 lg:grid-cols-4', className)}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className={cn(
              'bg-card flex flex-col gap-3 rounded-xl border px-3.5 py-3.5 sm:px-4',
              card.tone,
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {card.label}
              </span>
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-lg',
                  card.iconTone,
                )}
              >
                <Icon className="size-3.5" aria-hidden />
              </span>
            </div>

            <p className="text-foreground text-2xl font-semibold tracking-tight tabular-nums">
              {card.count.toLocaleString('en-IN')}
            </p>

            <div className="border-border/40 grid grid-cols-2 gap-2 border-t pt-2.5">
              <div className="min-w-0">
                <p className="text-muted-foreground text-[11px]">Acres</p>
                <p className="text-foreground truncate text-sm font-medium tabular-nums">
                  {formatAcres(card.acres)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground text-[11px]">Seed bags</p>
                <p className="text-foreground truncate text-sm font-medium tabular-nums">
                  {card.seedBags.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
