import { Link } from '@tanstack/react-router';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { activityMixLabel, formatAcres } from '@/features/dashboard/lib/labels';
import type { DailyActivityKpis } from '@/features/dashboard/types';

export function KpiStrip({ kpis }: { kpis: DailyActivityKpis }) {
  const cards = [
    {
      label: 'Activities',
      value: String(kpis.activityCount),
      detail: activityMixLabel(kpis.byType),
    },
    {
      label: 'Acres planted',
      value: formatAcres(kpis.acresPlanted),
      detail: 'On plantations in this period',
    },
    {
      label: 'Fields worked',
      value: String(kpis.fieldsWorked),
      detail: 'Fields with an entry in this period',
    },
    {
      label: 'Tasks due',
      value: String(kpis.tasksDue.total),
      detail: `${kpis.tasksDue.done} done · ${kpis.tasksDue.open} still open`,
    },
    {
      label: 'Officers reporting',
      value: String(kpis.officersReporting),
      detail: `${kpis.officersWithTasksDue} had a task due`,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      {cards.map((card) => (
        <PageCard key={card.label}>
          <PageCardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{card.value}</CardTitle>
          </PageCardHeader>
          <PageCardContent>
            <p className="text-sm text-muted-foreground">{card.detail}</p>
          </PageCardContent>
        </PageCard>
      ))}
      <PageCard>
        <PageCardHeader>
          <CardDescription>Overdue tasks</CardDescription>
          <CardTitle className="text-2xl tabular-nums">{kpis.overdueTasks}</CardTitle>
        </PageCardHeader>
        <PageCardContent>
          {kpis.overdueTasks === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing is overdue as of today</p>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">As of today</p>
              <Link
                to="/task-manager"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Open task manager
              </Link>
            </div>
          )}
        </PageCardContent>
      </PageCard>
    </div>
  );
}
