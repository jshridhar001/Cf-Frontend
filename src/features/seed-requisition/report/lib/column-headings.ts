export type ColumnHeadings = {
  farmer: string;
  variety: string;
  acres: string;
  seedBags: string;
  status: string;
  requisitionDate: string;
  requestedDeliveryDate: string;
  approvedDelivery: string;
  rejectionDate: string;
  remarks: string;
};

export const DEFAULT_COLUMN_HEADINGS: ColumnHeadings = {
  farmer: 'Farmer',
  variety: 'Variety',
  acres: 'Acres',
  seedBags: 'Seed Bags',
  status: 'Status',
  requisitionDate: 'Requisition Date',
  requestedDeliveryDate: 'Requested Delivery',
  approvedDelivery: 'Approved Delivery',
  rejectionDate: 'Rejection Date',
  remarks: 'Remarks',
};

export function useColumnHeadings() {
  return {
    headings: DEFAULT_COLUMN_HEADINGS,
    ready: true as const,
  };
}
