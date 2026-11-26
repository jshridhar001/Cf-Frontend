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
