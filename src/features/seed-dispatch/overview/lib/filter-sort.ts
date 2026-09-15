import {
  getFacilitySummary,
} from '@/features/seed-dispatch/overview/lib/derived';
import type {
  SeedDispatch,
  SeedDispatchStatus,
} from '@/features/seed-dispatch/overview/types';

export function filterAndSortDispatches(
  dispatches: SeedDispatch[],
  search: string,
  status?: SeedDispatchStatus,
): SeedDispatch[] {
  const query = search.trim().toLowerCase();
  return dispatches.filter((dispatch) => {
    if (status && dispatch.status !== status) return false;
    if (!query) return true;
    const facility = getFacilitySummary(dispatch).name.toLowerCase();
    const destination = dispatch.toLocation.toLowerCase();
    const truck = (dispatch.truckNumber ?? '').toLowerCase();
    const mobile = (dispatch.driverMobile ?? '').toLowerCase();
    return (
      facility.includes(query) ||
      destination.includes(query) ||
      truck.includes(query) ||
      mobile.includes(query)
    );
  });
}
