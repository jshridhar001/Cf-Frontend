export type SeedRequisitionApiStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type SeedRequisitionStatus = 'pending' | 'approved' | 'rejected';

export type SeedRequisitionFarmerSummary = {
  name: string;
  accountNumber: string;
  mobileNumber?: string;
  station?: { name: string } | null;
  locality?: { name: string } | null;
};

export type SeedRequisitionVarietySummary = {
  name: string;
};

export type SeedRequisitionUserSummary = {
  name: string;
};

/** Raw seed requisition entity from the API (list/detail). */
export type SeedRequisition = {
  id: string;
  farmerId: string;
  varietyId: string;
  status: SeedRequisitionApiStatus;
  requestedBags: number | null;
  requestedAcres: string | null;
  fulfilledBags: number | null;
  fulfilledAcres: string | null;
  requisitionDate: string;
  requestedDeliveryDate: string;
  approvedDeliveryDate?: string | null;
  remarks: string | null;
  rejectionRemarks: string | null;
  createdById: string;
  approvedById: string | null;
  rejectedById: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  farmer?: SeedRequisitionFarmerSummary | null;
  variety?: SeedRequisitionVarietySummary | null;
  createdBy?: SeedRequisitionUserSummary | null;
  approvedBy?: SeedRequisitionUserSummary | null;
  rejectedBy?: SeedRequisitionUserSummary | null;
  dispatchStops?: unknown[];
};

/** Flat row used by the seed requisition table (denormalized display fields). */
export type SeedRequisitionRow = {
  id: string;
  farmerId: string;
  varietyId: string;
  farmer: string;
  variety: string;
  acres: number;
  seedBags: number;
  status: SeedRequisitionStatus;
  /** YYYY-MM-DD */
  requisitionDate: string;
  /** YYYY-MM-DD */
  requestedDeliveryDate: string;
  /** YYYY-MM-DD or empty when unset */
  approvedDelivery: string;
  /** YYYY-MM-DD or empty when unset */
  rejectionDate: string;
  remarks: string;
  rejectionRemarks: string;
};

/** Flat detail model used by the single-requisition page. */
export type SeedRequisitionDetail = SeedRequisitionRow & {
  farmerAccountNumber: string;
  farmerMobile: string;
  station: string;
  locality: string;
  fulfilledQuantity: number;
  fulfilledAcres: number;
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdByName: string | null;
  approvedByName: string | null;
  rejectedByName: string | null;
};

export type SeedRequisitionListMeta = {
  page: number;
  pageSize: number;
  total: number;
};

export type SeedRequisitionsResponse = {
  success: boolean;
  data: SeedRequisition[];
  meta?: SeedRequisitionListMeta;
};

export type SeedRequisitionResponse = {
  success: boolean;
  data: SeedRequisition;
};

export type SeedRequisitionMessageResponse = {
  success: boolean;
  message: string;
};

export type CreateSeedRequisitionInput = {
  farmerId: string;
  varietyId: string;
  requestedBags?: number;
  requestedAcres?: number;
  requisitionDate: string;
  requestedDeliveryDate: string;
  remarks?: string;
};

export type UpdateSeedRequisitionInput = {
  farmerId?: string;
  varietyId?: string;
  requestedBags?: number | null;
  requestedAcres?: number | null;
  requisitionDate?: string;
  requestedDeliveryDate?: string;
  remarks?: string;
};

export type ReviewApproveSeedRequisitionInput = {
  status: 'APPROVED';
  approvedDeliveryDate: string;
};

export type ReviewRejectSeedRequisitionInput = {
  status: 'REJECTED';
  rejectionRemarks: string;
};

export type ReviewSeedRequisitionInput =
  | ReviewApproveSeedRequisitionInput
  | ReviewRejectSeedRequisitionInput;

export const SEED_REQUISITION_REPORT_TITLE = 'Seed Requisition — Report';

export type ColumnMeta = {
  headerClassName?: string;
  cellClassName?: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  filterLabel?: string;
  mono?: boolean;
  numeric?: boolean;
  wrap?: boolean;
  emphasize?: boolean;
  groupStart?: boolean;
  filterValueFormatter?: (value: unknown) => string;
};
