import type { QueryClient } from '@tanstack/react-query';

import { seedRequisitionKeys as overviewSeedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import {
  seedRequisitionKeys,
  seedRequisitionReportKeys,
} from '@/features/seed-requisition/report/api/query-keys';

export function invalidateSeedRequisitionCaches(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.all }),
    queryClient.invalidateQueries({ queryKey: overviewSeedRequisitionKeys.all }),
    queryClient.invalidateQueries({ queryKey: seedRequisitionReportKeys.all }),
  ]);
}
