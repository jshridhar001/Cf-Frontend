export const dashboardKeys = {
  all: ['dashboard'] as const,
  dailyActivity: (from: string | null, to: string | null) =>
    [...dashboardKeys.all, 'daily-activity', from ?? 'open', to ?? 'today'] as const,
};
