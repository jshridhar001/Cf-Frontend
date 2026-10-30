import type { FarmerReportParams } from '@/features/farmers/report/types';

export const farmersReportKeys = {
  all: ['farmers-report'] as const,
  list: (params: FarmerReportParams) => [...farmersReportKeys.all, 'list', params] as const,
};
