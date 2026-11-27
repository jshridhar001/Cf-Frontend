import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DatePickerInput,
  formatDateOnlyString,
  parseDateOnlyString,
} from '@/components/ui/date-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyActivity } from '@/features/dashboard/api/use-daily-activity';
import { ActivityList } from '@/features/dashboard/components/activity-list';
import { ActivityReportTable } from '@/features/dashboard/components/activity-report-table';
import { KpiStrip } from '@/features/dashboard/components/kpi-strip';
import { StationBreakdown } from '@/features/dashboard/components/station-breakdown';
import { TaskList } from '@/features/dashboard/components/task-list';
import {
  boundedCalendarDate,
  formatDashboardDate,
  kolkataToday,
  periodLabel,
} from '@/features/dashboard/lib/dates';
import { getApiErrorMessage } from '@/lib/api-client';

const dashboardRoute = getRouteApi('/_authenticated/dashboard');

export function DashboardPage() {
  const search = dashboardRoute.useSearch();
  const navigate = useNavigate();
  const today = kolkataToday();
  const from = boundedCalendarDate(search.from, today);
  let to = boundedCalendarDate(search.to, today);
  if (from && to && from > to) to = from;

  const { data, isPending, isError, error, isPlaceholderData } = useDailyActivity(from, to);

  useEffect(() => {
    if (search.from === from && search.to === to) return;
    void navigate({
      to: '/dashboard',
      search: {
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      },
      replace: true,
    });
  }, [from, navigate, search.from, search.to, to]);

  function goToRange(nextFrom: string | undefined, nextTo: string | undefined) {
    void navigate({
      to: '/dashboard',
      search: {
        ...(nextFrom ? { from: nextFrom } : {}),
        ...(nextTo ? { to: nextTo } : {}),
      },
    });
  }

  function setFrom(value: string | undefined) {
    const nextFrom = boundedCalendarDate(value, today);
    const nextTo = nextFrom && to && nextFrom > to ? nextFrom : to;
    goToRange(nextFrom, nextTo);
  }

  function setTo(value: string | undefined) {
    const nextTo = boundedCalendarDate(value, today);
    const nextFrom = from && nextTo && from > nextTo ? nextTo : from;
    goToRange(nextFrom, nextTo);
  }

  const subtitle = data ? periodLabel(data.from, data.to) : periodLabel(from ?? null, to ?? today);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            {subtitle}. Today stays listed below the period totals.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <DatePickerInput
            key={from ?? 'from-open'}
            id="dashboard-from"
            label="From"
            className="sm:w-44"
            placeholder="Start"
            value={from ? parseDateOnlyString(from) : undefined}
            onChange={(date) => setFrom(date ? formatDateOnlyString(date) : undefined)}
          />
          <DatePickerInput
            key={to ?? 'to-open'}
            id="dashboard-to"
            label="To"
            className="sm:w-44"
            placeholder="Today"
            value={to ? parseDateOnlyString(to) : undefined}
            onChange={(date) => setTo(date ? formatDateOnlyString(date) : undefined)}
          />
          {from || to ? (
            <Button type="button" variant="outline" onClick={() => goToRange(undefined, undefined)}>
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      {isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {['activities', 'acres', 'fields', 'tasks', 'officers', 'overdue'].map((slot) => (
            <Skeleton key={slot} className="h-32 rounded-md" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(error, 'Failed to load the field activity report.')}
        </p>
      ) : null}

      {data ? (
        <div className={isPlaceholderData ? 'opacity-60' : undefined}>
          <div className="flex flex-col gap-4 sm:gap-6">
            <KpiStrip kpis={data.kpis} />
            <StationBreakdown stations={data.stations} />
            <section className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-heading text-lg font-semibold tracking-tight">Today</h2>
                <p className="text-sm text-muted-foreground">
                  Field work dated {formatDashboardDate(data.today.date)}, and tasks due or
                  completed that day.
                </p>
              </div>
              <ActivityList activities={data.today.activities} />
              <TaskList tasks={data.today.tasks} />
            </section>
            <ActivityReportTable activities={data.activities} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
