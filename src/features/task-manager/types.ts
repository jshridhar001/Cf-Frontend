export const FIELD_TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED'] as const;

export const FIELD_TASK_ACTIVITIES = [
  'ROUGING',
  'STRIP_TEST_PRE_DEHAULMING',
  'DEHAULMING',
  'STRIP_TEST_POST_DEHAULMING',
] as const;

export type FieldTaskStatus = (typeof FIELD_TASK_STATUSES)[number];

export type FieldTaskActivity = (typeof FIELD_TASK_ACTIVITIES)[number];

export type FieldTaskField = {
  id: string;
  name: string;
  acres: string;
  farmerId: string;
};

export type FieldTaskPlantation = {
  id: string;
  startDate: string;
  endDate: string | null;
};

export type FieldTaskOfficer = {
  id: string;
  name: string;
  email: string;
};

export type FieldTask = {
  id: string;
  fieldId: string;
  plantationId: string;
  assignedOfficerId: string;
  activityType: FieldTaskActivity;
  status: FieldTaskStatus;
  dueDate: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies: string | null;
  project: string | null;
  completedRougingId: string | null;
  completedDehaulmingId: string | null;
  completedStripTestId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  field: FieldTaskField;
  plantation: FieldTaskPlantation;
  assignedOfficer: FieldTaskOfficer;
};

export type FieldTasksResponse = {
  success: boolean;
  data: FieldTask[];
};

export type TaskStatusFilter = 'all' | FieldTaskStatus;

export type TaskActivityFilter = 'all' | FieldTaskActivity;

export type TaskGroupBy = 'none' | 'field' | 'farmer' | 'officer' | 'status' | 'activity';

export function isFieldTaskStatus(value: string): value is FieldTaskStatus {
  return (FIELD_TASK_STATUSES as readonly string[]).includes(value);
}

export function isFieldTaskActivity(value: string): value is FieldTaskActivity {
  return (FIELD_TASK_ACTIVITIES as readonly string[]).includes(value);
}

export function isTaskStatusFilter(value: string): value is TaskStatusFilter {
  return value === 'all' || isFieldTaskStatus(value);
}

export function isTaskActivityFilter(value: string): value is TaskActivityFilter {
  return value === 'all' || isFieldTaskActivity(value);
}

export function isTaskGroupBy(value: string): value is TaskGroupBy {
  return (
    value === 'none' ||
    value === 'field' ||
    value === 'farmer' ||
    value === 'officer' ||
    value === 'status' ||
    value === 'activity'
  );
}
