import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFarmers } from '@/features/farmers/overview/api/use-farmers';
import { useOfficerFieldTasks } from '@/features/task-manager/api/use-field-tasks';
import { OfficerFieldTimeline } from '@/features/task-manager/components/officer-field-timeline';
import { TaskList } from '@/features/task-manager/components/task-manager-page';
import { buildOfficerSchedule } from '@/features/task-manager/lib/officer-schedule';
import { getApiErrorMessage } from '@/lib/api-client';

function countLabel(count: number, singular: string, plural: string) {
  return `${count.toLocaleString('en-IN')} ${count === 1 ? singular : plural}`;
}

export function OfficerTimelinePage({ officerId }: { officerId: string }) {
  const tasksQuery = useOfficerFieldTasks(officerId);
  const farmersQuery = useFarmers();
  const schedule = useMemo(() => {
    const farmerNames = new Map(
      (farmersQuery.data ?? []).map((farmer) => [farmer.id, farmer.name]),
    );
    return buildOfficerSchedule(tasksQuery.data ?? [], farmerNames);
  }, [farmersQuery.data, tasksQuery.data]);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground hover:text-foreground"
        asChild
      >
        <Link to="/task-manager">
          <ArrowLeft className="size-4" />
          Back to tasks
        </Link>
      </Button>

      <PageCard>
        <PageCardHeader>
          <CardTitle>
            {tasksQuery.isPending ? <Skeleton className="h-6 w-40" /> : schedule.officerName}
          </CardTitle>
          <CardDescription className="hidden sm:block">Season schedule for fields assigned to this officer.</CardDescription>
        </PageCardHeader>
        <PageCardContent className="flex flex-col gap-4">
          {tasksQuery.isPending ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-full max-w-md" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : null}

          {tasksQuery.isError ? (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(tasksQuery.error, "Couldn't load this officer's tasks.")}
            </p>
          ) : null}

          {tasksQuery.isSuccess ? (
            <>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Field operations · Season schedule
                </p>
                <h2 className="text-lg font-semibold tracking-tight">
                  {schedule.officerName} Timeline
                </h2>
                <p className="text-sm text-muted-foreground">
                  {countLabel(schedule.fieldCount, 'field', 'fields')} ·{' '}
                  {countLabel(schedule.taskCount, 'task', 'tasks')}
                </p>
              </div>
              <OfficerFieldTimeline schedule={schedule} />
            </>
          ) : null}
        </PageCardContent>
      </PageCard>

      <PageCard>
        <PageCardContent>
          <TaskList
            tasks={tasksQuery.data}
            isPending={tasksQuery.isPending}
            isError={tasksQuery.isError}
            error={tasksQuery.error}
            showOfficer={false}
            searchPlaceholder="Search by task, field, farmer..."
          />
        </PageCardContent>
      </PageCard>
    </div>
  );
}
