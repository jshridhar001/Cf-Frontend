import type { FacilityUsedIn } from '@/features/master/types';
import { FACILITY_USED_IN_VALUES } from '@/features/master/types';

export const FACILITY_USED_IN_OPTIONS = [
  { label: 'Seed Requisition', value: 'SEED-REQUISITION' },
  { label: 'Seed Dispatch', value: 'SEED-DISPATCH' },
  { label: 'Field Step', value: 'FIELD-STEP' },
] as const satisfies ReadonlyArray<{ label: string; value: FacilityUsedIn }>;

export function getFacilityUsedInLabel(usedIn: string): string {
  return FACILITY_USED_IN_OPTIONS.find((item) => item.value === usedIn)?.label ?? usedIn;
}

export function isFacilityUsedIn(value: string): value is FacilityUsedIn {
  return (FACILITY_USED_IN_VALUES as readonly string[]).includes(value);
}
