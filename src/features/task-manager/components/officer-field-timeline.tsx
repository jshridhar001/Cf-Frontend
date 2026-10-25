import { Gantt, type ITask, Willow } from '@svar-ui/react-gantt';
import { Link } from '@tanstack/react-router';
import { useSyncExternalStore } from 'react';
import '@svar-ui/react-gantt/all.css';
import '@/features/task-manager/components/officer-field-timeline.css';
import { format } from 'date-fns';
import { parseDateOnlyString } from '@/components/ui/date-picker';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ACTIVITY_BAR_CLASS,
  type OfficerSchedule,
  type ScheduleActivity,
  type ScheduleTask,
} from '@/features/task-manager/lib/officer-schedule';
import { activityLabel, localToday } from '@/features/task-manager/lib/task-view';
import { FIELD_TASK_ACTIVITIES } from '@/features/task-manager/types';
import { cn } from '@/lib/utils';

const SCALE_HEIGHT = 32;
const CELL_HEIGHT = 52;
const DESKTOP_QUERY = '(min-width: 640px)';

function subscribeColumnWidth(onChange: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function fieldColumnWidth() {
  return window.matchMedia(DESKTOP_QUERY).matches ? 240 : 168;
}

function ActivityBars({ data }: { data: ITask }) {
  const activities = Array.isArray(data.activities) ? (data.activities as ScheduleActivity[]) : [];
  if (data.type === 'summary') {
    return (
      <div className="relative h-full w-full">
        {activities.map((activity) => (
          <Tooltip key={activity.id}>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  'absolute top-1.5 bottom-1.5 flex items-center overflow-hidden rounded-md px-1.5 text-[11px] font-medium text-white',
                  ACTIVITY_BAR_CLASS[activity.activityType],
                )}
                style={{
                  left: `calc(${activity.left}% + 2px)`,
                  width: `max(1.25rem, calc(${activity.width}% - 4px))`,
                }}
              >
                <span className="truncate">{activity.label}</span>
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="gantt-bar-tip flex flex-col items-start gap-0.5 rounded-lg bg-popover px-3 py-2 text-left text-popover-foreground shadow-md"
            >
              <p className="text-sm font-semibold">{activity.label}</p>
              <p className="text-muted-foreground">
                {activity.fieldName} · #{activity.rowNumber}
              </p>
              <p className="text-muted-foreground">
                {activity.startDate} → {activity.endDate}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  }

  const activityType = data.activityType as ScheduleActivity['activityType'] | undefined;
  if (!activityType) return null;

  return (
    <div
      className={cn(
        'flex h-full items-center truncate px-1.5 text-[11px] font-medium text-white',
        ACTIVITY_BAR_CLASS[activityType],
      )}
    >
      {data.text}
    </div>
  );
}

function FieldCell({ row }: { row: ScheduleTask }) {
  if (row.type !== 'summary' || !row.fieldId || !row.farmerId) return null;

  return (
    <div className="flex min-w-0 items-start gap-2 py-1 pr-2">
      <span className="w-4 shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums">
        {row.rowNumber}
      </span>
      <div className="min-w-0">
        <Link
          to="/farmers/$id/fields/$fieldId"
          params={{ id: row.farmerId, fieldId: row.fieldId }}
          className="block truncate text-sm font-medium text-primary hover:underline"
        >
          {row.fieldName}
        </Link>
        <p className="truncate text-xs text-muted-foreground">{row.farmerName}</p>
      </div>
    </div>
  );
}

function nextDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

export function OfficerFieldTimeline({ schedule }: { schedule: OfficerSchedule }) {
  const columnWidth = useSyncExternalStore(subscribeColumnWidth, fieldColumnWidth, () => 240);
  const markerToday = schedule.todayInRange ? parseDateOnlyString(localToday()) : undefined;

  if (!schedule.start || !schedule.end || schedule.tasks.length === 0) {
    return (
      <p className="rounded-lg border px-3 py-8 text-center text-sm text-muted-foreground">
        No tasks for this officer.
      </p>
    );
  }

  const height = SCALE_HEIGHT * 2 + schedule.fieldCount * CELL_HEIGHT + 8;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {FIELD_TASK_ACTIVITIES.map((activity) => (
          <li key={activity} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn('size-2.5 rounded-sm', ACTIVITY_BAR_CLASS[activity])} />
            {activityLabel(activity)}
          </li>
        ))}
      </ul>
      <div
        className="officer-timeline w-full min-w-0 max-w-full overflow-hidden rounded-lg border"
        style={{ height }}
      >
        <Willow fonts={false}>
          <Gantt
            tasks={schedule.tasks}
            readonly
            inclusiveEnd
            rollups
            cellHeight={CELL_HEIGHT}
            scaleHeight={SCALE_HEIGHT}
            cellWidth={44}
            start={schedule.start}
            end={nextDay(schedule.end)}
            scales={[
              { unit: 'day', step: 1, format: (date) => format(date, 'EEE') },
              { unit: 'day', step: 1, format: (date) => format(date, 'd') },
            ]}
            markers={
              markerToday ? [{ start: markerToday, text: 'Today', css: 'officer-today' }] : []
            }
            columns={[
              {
                id: 'field',
                header: 'Field',
                width: columnWidth,
                resize: false,
                sort: false,
                cell: ({ row }) => <FieldCell row={row as ScheduleTask} />,
              },
            ]}
            taskTemplate={ActivityBars}
          />
        </Willow>
      </div>
      <p className="text-xs text-muted-foreground">
        Each row is a field. Bars are colored by process stage.
      </p>
    </div>
  );
}
