import { format } from 'date-fns';
import { formatDateOnlyString, parseDateOnlyString } from '@/components/ui/date-picker';
import type {
  FieldTask,
  FieldTaskActivity,
  TaskActivityFilter,
  TaskGroupBy,
  TaskStatusFilter,
} from '@/features/task-manager/types';

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

export type TaskGroup = {
  key: string;
  label: string | null;
  items: TaskListItem[];
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

export function taskFilterCount(
  status: TaskStatusFilter,
  activity: TaskActivityFilter,
  groupBy: TaskGroupBy,
) {
  return Number(status !== 'all') + Number(activity !== 'all') + Number(groupBy !== 'none');
}

export function matchesTaskSearch(item: TaskListItem, search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return [item.activityLabel, item.fieldName, item.farmerName, item.officerName].some((value) =>
    value.toLowerCase().includes(query),
  );
}

export function filterTasks(
  items: TaskListItem[],
  search: string,
  status: TaskStatusFilter,
  activity: TaskActivityFilter,
) {
  return items.filter((item) => {
    if (status !== 'all' && item.task.status !== status) return false;
    if (activity !== 'all' && item.task.activityType !== activity) return false;
    return matchesTaskSearch(item, search);
  });
}

function groupKey(item: TaskListItem, groupBy: TaskGroupBy) {
  switch (groupBy) {
    case 'field':
      return item.fieldName;
    case 'farmer':
      return item.farmerName;
    case 'officer':
      return item.officerName;
    case 'status':
      return item.status.label;
    case 'activity':
      return item.activityLabel;
    case 'none':
      return '';
  }
}

export function groupTaskPage(items: TaskListItem[], groupBy: TaskGroupBy): TaskGroup[] {
  if (groupBy === 'none') return [{ key: 'all', label: null, items }];

  const groups: TaskGroup[] = [];
  const indexByKey = new Map<string, number>();

  for (const item of items) {
    const label = groupKey(item, groupBy);
    const existing = indexByKey.get(label);
    if (existing == null) {
      indexByKey.set(label, groups.length);
      groups.push({ key: label, label, items: [item] });
      continue;
    }
    groups[existing]?.items.push(item);
  }

  return groups;
}
