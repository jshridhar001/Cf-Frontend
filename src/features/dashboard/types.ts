export const ACTIVITY_KINDS = [
  'plantation',
  'irrigation',
  'rouging',
  'strip_test',
  'dehaulming',
  'visit',
] as const;

export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export type DailyActivity = {
  id: string;
  kind: ActivityKind;
  fieldId: string;
  fieldName: string;
  farmerId: string;
  farmerName: string;
  stationId: string;
  stationName: string;
  officerId: string;
  officerName: string;
  startDate: string;
  endDate: string | null;
  summary: string;
};

export type DailyTask = {
  id: string;
  name: string;
  activityType: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  dueDate: string;
  completedAt: string | null;
  dueToday: boolean;
  completedToday: boolean;
  fieldId: string;
  fieldName: string;
  farmerId: string;
  farmerName: string;
  stationId: string;
  stationName: string;
  officerId: string;
  officerName: string;
};

export type DailyActivityStation = {
  stationId: string;
  stationName: string;
  activityCount: number;
  acresPlanted: string;
  fieldsWorked: number;
};

export type DailyActivityKpis = {
  activityCount: number;
  byType: Record<ActivityKind, number>;
  acresPlanted: string;
  fieldsWorked: number;
  tasksDue: {
    total: number;
    done: number;
    open: number;
  };
  tasksCompleted: number;
  overdueTasks: number;
  officersReporting: number;
  officersWithTasksDue: number;
};

export type FieldActivityDashboard = {
  from: string | null;
  to: string;
  timezone: 'Asia/Kolkata';
  kpis: DailyActivityKpis;
  stations: DailyActivityStation[];
  activities: DailyActivity[];
  today: {
    date: string;
    activities: DailyActivity[];
    tasks: DailyTask[];
  };
};

export type DailyActivityResponse = {
  success: true;
  data: FieldActivityDashboard;
};
