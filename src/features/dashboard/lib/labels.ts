import { ACTIVITY_KINDS, type ActivityKind, type DailyTask } from '@/features/dashboard/types';

const KIND_LABELS: Record<ActivityKind, readonly [string, string]> = {
  plantation: ['plantation', 'plantations'],
  irrigation: ['irrigation', 'irrigations'],
  rouging: ['rouging', 'rougings'],
  strip_test: ['strip test', 'strip tests'],
  dehaulming: ['dehaulming', 'dehaulmings'],
  visit: ['visit', 'visits'],
};

const acresFormat = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
});

export function activityKindLabel(kind: ActivityKind): string {
  const [singular] = KIND_LABELS[kind];
  return singular.charAt(0).toUpperCase() + singular.slice(1);
}

export function activityMixLabel(byType: Record<ActivityKind, number>): string {
  const parts = ACTIVITY_KINDS.flatMap((kind) => {
    const count = byType[kind];
    if (count === 0) return [];
    const [one, many] = KIND_LABELS[kind];
    return [`${count} ${count === 1 ? one : many}`];
  });

  return parts.length > 0 ? parts.join(' · ') : 'No field entries in this period';
}

export function formatAcres(value: string): string {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return value;
  return acresFormat.format(parsed);
}

export function taskStatusLabel(status: DailyTask['status']): string {
  if (status === 'DONE') return 'Done';
  if (status === 'IN_PROGRESS') return 'In progress';
  return 'Pending';
}
