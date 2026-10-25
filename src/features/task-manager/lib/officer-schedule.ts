import { formatDateOnlyString, parseDateOnlyString } from '@/components/ui/date-picker';
import { activityLabel, localToday } from '@/features/task-manager/lib/task-view';
import type { FieldTask, FieldTaskActivity } from '@/features/task-manager/types';

export const ACTIVITY_BAR_CLASS: Record<FieldTaskActivity, string> = {
  ROUGING: 'bg-amber-500',
  STRIP_TEST_PRE_DEHAULMING: 'bg-blue-600',
  DEHAULMING: 'bg-emerald-600',
  STRIP_TEST_POST_DEHAULMING: 'bg-orange-500',
};

export type ScheduleActivity = {
  id: string;
  label: string;
  activityType: FieldTaskActivity;
  left: number;
  width: number;
  fieldName: string;
  rowNumber: number;
  startDate: string;
  endDate: string;
};

export type ScheduleTask = {
  id: string;
  text: string;
  start?: Date;
  end?: Date;
  type: 'summary' | 'task';
  parent?: string;
  open?: boolean;
  rollup?: boolean;
  activityType?: FieldTaskActivity;
  activities?: ScheduleActivity[];
  fieldId?: string;
  farmerId?: string;
  fieldName?: string;
  farmerName?: string;
  rowNumber?: number;
};

export type OfficerSchedule = {
  officerName: string;
  fieldCount: number;
  taskCount: number;
  start: Date | null;
  end: Date | null;
  todayInRange: boolean;
  tasks: ScheduleTask[];
};

function dayIndex(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

function placeActivity(start: Date, end: Date, rangeStart: Date, rangeEnd: Date) {
  const origin = dayIndex(rangeStart);
  const span = dayIndex(rangeEnd) - origin + 1;
  const left = ((dayIndex(start) - origin) / span) * 100;
  const width = ((dayIndex(end) - dayIndex(start) + 1) / span) * 100;
  return { left, width };
}

export function buildOfficerSchedule(
  tasks: FieldTask[],
  farmerNames: Map<string, string>,
  today = localToday(),
): OfficerSchedule {
  const officerName = tasks[0]?.assignedOfficer.name || 'Officer';
  const dated = tasks.flatMap((task) => {
    const start = parseDateOnlyString(task.startDate);
    const end = parseDateOnlyString(task.endDate);
    return start && end ? [{ task, start, end }] : [];
  });

  if (dated.length === 0) {
    return {
      officerName,
      fieldCount: 0,
      taskCount: 0,
      start: null,
      end: null,
      todayInRange: false,
      tasks: [],
    };
  }

  const rangeStart = dated.reduce(
    (earliest, item) => (item.start < earliest ? item.start : earliest),
    dated[0].start,
  );
  const rangeEnd = dated.reduce(
    (latest, item) => (item.end > latest ? item.end : latest),
    dated[0].end,
  );
  const todayDate = parseDateOnlyString(today);
  const todayInRange = Boolean(
    todayDate &&
      dayIndex(todayDate) >= dayIndex(rangeStart) &&
      dayIndex(todayDate) <= dayIndex(rangeEnd),
  );

  const fieldOrder: string[] = [];
  const byField = new Map<string, typeof dated>();
  for (const item of dated) {
    const existing = byField.get(item.task.fieldId);
    if (existing) {
      existing.push(item);
      continue;
    }
    fieldOrder.push(item.task.fieldId);
    byField.set(item.task.fieldId, [item]);
  }

  const scheduleTasks: ScheduleTask[] = [];
  fieldOrder.forEach((fieldId, index) => {
    const items = byField.get(fieldId) ?? [];
    const first = items[0];
    if (!first) return;
    const summaryId = `field:${fieldId}`;
    const fieldStart = items.reduce(
      (earliest, item) => (item.start < earliest ? item.start : earliest),
      first.start,
    );
    const fieldEnd = items.reduce(
      (latest, item) => (item.end > latest ? item.end : latest),
      first.end,
    );

    scheduleTasks.push({
      id: summaryId,
      text: first.task.field.name,
      type: 'summary',
      open: false,
      start: fieldStart,
      end: fieldEnd,
      fieldId,
      farmerId: first.task.field.farmerId,
      fieldName: first.task.field.name,
      farmerName: farmerNames.get(first.task.field.farmerId) || '—',
      rowNumber: index + 1,
      activities: items.map((item) => ({
        id: item.task.id,
        label: activityLabel(item.task.activityType),
        activityType: item.task.activityType,
        fieldName: first.task.field.name,
        rowNumber: index + 1,
        startDate: item.task.startDate,
        endDate: item.task.endDate,
        ...placeActivity(item.start, item.end, fieldStart, fieldEnd),
      })),
    });

    for (const item of items) {
      scheduleTasks.push({
        id: item.task.id,
        text: activityLabel(item.task.activityType),
        type: 'task',
        parent: summaryId,
        rollup: true,
        start: item.start,
        end: item.end,
        activityType: item.task.activityType,
      });
    }
  });

  return {
    officerName,
    fieldCount: fieldOrder.length,
    taskCount: dated.length,
    start: rangeStart,
    end: rangeEnd,
    todayInRange,
    tasks: scheduleTasks,
  };
}

export function formatScheduleDay(date: Date | null) {
  return date ? formatDateOnlyString(date) : null;
}
