export const FARMER_REPORT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;

export type FarmerReportStatus = (typeof FARMER_REPORT_STATUSES)[number];

export type FarmerReportQuantityUnit = 'ACRES' | 'BAGS';

export type FarmerReportParams = {
  stationId?: string;
  farmerId?: string;
  varietyId?: string;
  status?: FarmerReportStatus;
};

export type FarmerReportStation = {
  id: string;
  name: string;
};

export type FarmerReportFamily = {
  id: string;
  name: string;
};

export type FarmerReportFarmer = {
  id: string;
  name: string;
  accountNumber: string;
  station: FarmerReportStation;
  family: FarmerReportFamily | null;
};

export type FarmerReportVariety = {
  id: string;
  name: string;
};

export type FarmerReportExpectedSize = {
  id: string;
  name: string;
  seedBagsPerAcre: number;
};

export type FarmerReportDispatchedSize = {
  sizeId: string;
  sizeName: string;
  seedBagsPerAcre: number;
  bags: number;
  acres: string;
};

export type FarmerReportRequisition = {
  requisitionId: string;
  status: FarmerReportStatus;
  requisitionDate: string | null;
  contractDate: string | null;
  farmer: FarmerReportFarmer;
  variety: FarmerReportVariety;
  quantityUnit: FarmerReportQuantityUnit;
  expectedSize: FarmerReportExpectedSize | null;
  requestedBags: number | null;
  requestedAcres: string | null;
  dispatchedBags: number;
  dispatchedAcres: string;
  remainingBags: number | null;
  remainingAcres: string | null;
  dispatchedSizes: FarmerReportDispatchedSize[];
};

export type FarmersReportResponse = {
  success: boolean;
  data: FarmerReportRequisition[];
};

export function isFarmerReportStatus(value: string): value is FarmerReportStatus {
  return (FARMER_REPORT_STATUSES as readonly string[]).includes(value);
}
