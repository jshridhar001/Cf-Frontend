export const PROFILE_TABS = [
  { value: 'contract', label: 'Farmer Contract' },
  { value: 'requisitions', label: 'Seed Requisitions' },
  { value: 'dispatches', label: 'Seed Dispatches' },
  { value: 'fields', label: 'Seed & fields' },
] as const;

export type FarmerProfileTab = (typeof PROFILE_TABS)[number]['value'];
export const DEFAULT_PROFILE_TAB: FarmerProfileTab = 'contract';
export const FARMER_PROFILE_TAB_VALUES = PROFILE_TABS.map((tab) => tab.value) as [
  FarmerProfileTab,
  ...FarmerProfileTab[],
];

export function isFarmerProfileTab(value: string): value is FarmerProfileTab {
  return FARMER_PROFILE_TAB_VALUES.includes(value as FarmerProfileTab);
}
