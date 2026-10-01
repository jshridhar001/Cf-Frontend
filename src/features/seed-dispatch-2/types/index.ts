export type SeedDispatchStatus = 'delivering' | 'delivered' | 'null';

export type SeedDispatchApiStatus = 'IN_TRANSIT' | 'DELIVERED' | 'NULL';

export type FacilityDispatch = {
  facilityName: string;
  bags: number;
};

export type SeedDispatch = {
  id: string;
  status: SeedDispatchStatus;
  farmersSelected: number;
  farmersReceived: number;
  dispatchDate: string | null;
  deliveredOn: string | null;
  facilities: FacilityDispatch[];
  destination: string;
  remarks: string;
  netWeightKg: number;
  truckNumber: string;
  driverMobile: string;
  acres: number;
  seedBags: number;
};

export type DispatchableRequisition = {
  id: string;
  farmer: {
    name: string;
    accountNumber: number;
  };
  variety: {
    name: string;
  };
  acres: string | null;
  seedBagsInitialQuantity: string | null;
  fulfilledQuantity: string;
  fulfilledAcres: string;
  remarks: string | null;
  requisitionDate: string;
  approvedDeliveryDate: string | null;
  remainingQuantity: string;
  initialQuantity: string | null;
  isAcresBased: boolean;
};

export type SeedDispatchSizeLineApi = {
  id: string;
  dispatchRequisitionId: string;
  facilityId: string;
  sizeId: string;
  generationId: string;
  bagQuantity: number;
  facility?: { id: string; name: string } | null;
  size?: { id: string; name: string } | null;
  generation?: { id: string; name: string } | null;
};

export type SeedDispatchRequisitionApi = {
  id: string;
  dispatchId: string;
  requisitionId: string;
  status: string;
  otpSentAt: string | null;
  otpVerifiedAt: string | null;
  receivedAt: string | null;
  receivedById: string | null;
  sizeLines: SeedDispatchSizeLineApi[];
  requisition?: {
    id: string;
    farmer?: {
      id: string;
      name: string;
      accountNumber: string;
      mobileNumber: string;
    } | null;
    variety?: {
      id: string;
      name: string;
    } | null;
  } | null;
};

/** Raw seed dispatch entity from the API (list/detail). */
export type SeedDispatchApi = {
  id: string;
  toLocation: string;
  status: SeedDispatchApiStatus;
  dispatchDate: string | null;
  truckNumber: string;
  driverMobile: string | null;
  manualGatePassNumber: string | null;
  weightSlipNumber: string | null;
  grossWeight: string | null;
  tareWeight: string | null;
  netWeight: string | null;
  remarks: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  dispatchRequisitions?: SeedDispatchRequisitionApi[];
};

export type SeedDispatchLotStatus = 'PENDING' | 'RECEIVED';

export type SeedDispatchLotSizeLine = {
  facilityName: string;
  generationName: string;
  sizeName: string;
  quantity: number;
};

export type SeedDispatchLot = {
  id: string;
  status: SeedDispatchLotStatus;
  farmerName: string;
  farmerAccountNumber: string;
  mobileNumber: string;
  mobileMasked: string;
  varietyName: string;
  bagTotal: number;
  sizeLines: SeedDispatchLotSizeLine[];
  otpSentAt: string | null;
  receivedAt: string | null;
};

export type SeedDispatchDetail = {
  id: string;
  status: SeedDispatchStatus;
  dispatchDate: string | null;
  deliveredOn: string | null;
  destination: string;
  truckNumber: string;
  manualGatePassNumber: string | null;
  weightSlipNumber: string | null;
  driverMobile: string;
  grossWeight: number | null;
  tareWeight: number | null;
  netWeightKg: number | null;
  averageWeightPerBag: number | null;
  remarks: string | null;
  facilities: FacilityDispatch[];
  seedBags: number;
  progress: { received: number; total: number };
  lots: SeedDispatchLot[];
};

export type SendLotReceiptOtpSuccess = {
  ok: true;
  mobileNumber: string;
  maskedMobile: string;
  cooldownSeconds: number;
  devOtp?: string;
};

export type ConfirmLotReceiptSuccess = {
  ok: true;
  alreadyReceived?: boolean;
  farmerId?: string;
};

export type LotReceiptErrorResponse = {
  ok: false;
  error: string;
};

export type SendLotReceiptOtpResponse = SendLotReceiptOtpSuccess | LotReceiptErrorResponse;
export type ConfirmLotReceiptResponse = ConfirmLotReceiptSuccess | LotReceiptErrorResponse;

export type SeedDispatchesResponse = {
  success: boolean;
  data: SeedDispatchApi[];
};

export type SeedDispatchResponse = {
  success: boolean;
  data: SeedDispatchApi;
};

export type SeedDispatchMessageResponse = {
  success: boolean;
  message: string;
  data?: SeedDispatchApi;
};

export type CreateSeedDispatchLineInput = {
  facilityId: string;
  sizeId: string;
  generationId: string;
  bagQuantity: number;
};

export type CreateSeedDispatchRequisitionInput = {
  requisitionId: string;
  lines: CreateSeedDispatchLineInput[];
};

export type CreateSeedDispatchInput = {
  toLocation: string;
  truckNumber: string;
  driverMobile?: string;
  manualGatePassNumber?: string;
  weightSlipNumber?: string;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;
  remarks?: string;
  requisitions: CreateSeedDispatchRequisitionInput[];
};

export type UpdateSeedDispatchStatusInput = {
  status: 'IN_TRANSIT' | 'DELIVERED';
  remarks?: string;
};

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
