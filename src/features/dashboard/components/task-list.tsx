import { Link } from '@tanstack/react-router';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Badge } from '@/components/ui/badge';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { formatDashboardDate } from '@/features/dashboard/lib/dates';
import { taskStatusLabel } from '@/features/dashboard/lib/labels';
import type { DailyTask } from '@/features/dashboard/types';

function statusVariant(status: DailyTask['status']) {
  if (status === 'DONE') return 'secondary' as const;
  if (status === 'IN_PROGRESS') return 'default' as const;
  return 'outline' as const;
}

function TaskRows({ tasks }: { tasks: DailyTask[] }) {
  return (
    <ul className="divide-y">
      {tasks.map((task) => (
        <li key={task.id}>
          <Link
            to="/farmers/$id/fields/$fieldId"
            params={{ id: task.farmerId, fieldId: task.fieldId }}
            className="flex flex-col gap-1 py-3 hover:bg-muted/40 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{task.name}</p>
                <Badge variant={statusVariant(task.status)}>{taskStatusLabel(task.status)}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {task.farmerName} · {task.fieldName} · {task.stationName}
              </p>
            </div>
            <p className="shrink-0 text-sm text-muted-foreground">
              {task.officerName}
              {task.dueToday ? '' : ` · due ${formatDashboardDate(task.dueDate)}`}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function TaskList({ tasks }: { tasks: DailyTask[] }) {
  const dueToday = tasks.filter((task) => task.dueToday);
  const completedOnAnotherDay = tasks.filter((task) => task.completedToday && !task.dueToday);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <PageCard>
        <PageCardHeader>
          <CardTitle>Tasks due</CardTitle>
          <CardDescription>Scheduled for this day, excluding cancelled tasks.</CardDescription>
        </PageCardHeader>
        <PageCardContent>
          {dueToday.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks are due this day.</p>
          ) : (
            <TaskRows tasks={dueToday} />
          )}
        </PageCardContent>
      </PageCard>

      {completedOnAnotherDay.length > 0 ? (
        <PageCard>
          <PageCardHeader>
            <CardTitle>Completed this day</CardTitle>
            <CardDescription>Closed today, with a due date on another day.</CardDescription>
          </PageCardHeader>
          <PageCardContent>
            <TaskRows tasks={completedOnAnotherDay} />
          </PageCardContent>
        </PageCard>
      ) : null}
    </div>
  );
}
