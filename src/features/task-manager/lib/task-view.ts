import { format } from 'date-fns';
import { formatDateOnlyString, parseDateOnlyString } from '@/components/ui/date-picker';
import type { FieldTask, FieldTaskActivity } from '@/features/task-manager/types';

export const TASK_PAGE_SIZE = 10;

const ACTIVITY_LABELS: Record<FieldTaskActivity, string> = {
  ROUGING: 'Rouging',
  STRIP_TEST_PRE_DEHAULMING: 'Strip Test (Pre-Dehaulming)',
  DEHAULMING: 'Dehaulming',
  STRIP_TEST_POST_DEHAULMING: 'Strip Test (Post-Dehaulming)',
};

export type TaskStatusView = {
  label: string;
  className: string;
};

export type TaskListItem = {
  task: FieldTask;
  activityLabel: string;
  farmerName: string;
  fieldName: string;
  officerName: string;
  dueLabel: string;
  status: TaskStatusView;
};

export function activityLabel(activity: FieldTaskActivity) {
  return ACTIVITY_LABELS[activity];
}

export function localToday() {
  return formatDateOnlyString(new Date());
}

export function isOverdue(task: Pick<FieldTask, 'status' | 'dueDate'>, today = localToday()) {
  return task.status === 'PENDING' && task.dueDate < today;
}

export function taskStatusView(
  task: Pick<FieldTask, 'status' | 'dueDate'>,
  today = localToday(),
): TaskStatusView {
  if (isOverdue(task, today)) {
    return {
      label: 'Overdue',
      className: 'border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20',
    };
  }

  switch (task.status) {
    case 'PENDING':
      return {
        label: 'Pending',
        className:
          'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
      };
    case 'IN_PROGRESS':
      return {
        label: 'In progress',
        className: 'border-transparent bg-primary/10 text-primary dark:bg-primary/20',
      };
    case 'DONE':
      return {
        label: 'Done',
        className:
          'border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        className: 'border-border bg-muted text-muted-foreground',
      };
  }
}

export function formatDueDate(value: string) {
  const date = parseDateOnlyString(value);
  return date ? format(date, 'd MMM yyyy') : value;
}

export function toTaskListItem(
  task: FieldTask,
  farmerNames: Map<string, string>,
  today = localToday(),
): TaskListItem {
  return {
    task,
    activityLabel: activityLabel(task.activityType),
    farmerName: farmerNames.get(task.field.farmerId) || '—',
    fieldName: task.field.name,
    officerName: task.assignedOfficer.name,
    dueLabel: formatDueDate(task.dueDate),
    status: taskStatusView(task, today),
  };
}

export function matchesTaskSearch(item: TaskListItem, search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return [item.activityLabel, item.fieldName, item.farmerName, item.officerName].some((value) =>
    value.toLowerCase().includes(query),
  );
}
