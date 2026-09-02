export const FARMER_PROFILE_TABS = ['contract', 'requisitions', 'dispatches', 'fields'] as const;

export type FarmerProfileTab = (typeof FARMER_PROFILE_TABS)[number];

export const farmerProfileTabItems: {
  value: FarmerProfileTab;
  label: string;
  emptyTitle: string;
  emptyDescription: string;
}[] = [
  {
    value: 'contract',
    label: 'Farmer Contract',
    emptyTitle: 'No contracts yet',
    emptyDescription: 'Contracts for this farmer will appear here.',
  },
  {
    value: 'requisitions',
    label: 'Seed Requisitions',
    emptyTitle: 'No seed requisitions yet',
    emptyDescription: 'Seed requisitions for this farmer will appear here.',
  },
  {
    value: 'dispatches',
    label: 'Seed Dispatches',
    emptyTitle: 'No seed dispatches yet',
    emptyDescription: 'Seed dispatches for this farmer will appear here.',
  },
  {
    value: 'fields',
    label: 'Seed & fields',
    emptyTitle: 'No seed and fields yet',
    emptyDescription: 'Seed and field records for this farmer will appear here.',
  },
];
