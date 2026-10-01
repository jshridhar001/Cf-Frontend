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

export type CreateSeedDispatchLineInput = {
  facilityId: string;
  sizeId: string;
  generationId: string;
  bagQuantity: number;
};

export type CreateSeedDispatchRequisitionInput = {
  requisitionId: string;
  sizeLines: CreateSeedDispatchLineInput[];
};

export type CreateSeedDispatchInput = {
  toLocation: string;
  truckNumber: string;
  status: 'IN_TRANSIT';
  dispatchDate: string;
  driverMobile?: string;
  manualGatePassNumber?: string;
  weightSlipNumber?: string;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;
  remarks?: string;
  requisitions: CreateSeedDispatchRequisitionInput[];
};

export type CreatedSeedDispatchSizeLine = {
  bagQuantity: number;
  facility: { name: string };
  size: { name: string };
  generation: { name: string };
};

export type CreatedSeedDispatchRequisition = {
  id: string;
  status: 'PENDING';
  requisition: {
    status: string;
    requestedAcres: string | null;
    farmer: { name: string; accountNumber: string };
    variety: { name: string };
  };
  sizeLines: CreatedSeedDispatchSizeLine[];
};

/** 201 body from POST /api/v1/seed-dispatches. Omitted weights and gate pass come back null. */
export type CreatedSeedDispatch = {
  id: string;
  toLocation: string;
  status: 'IN_TRANSIT';
  dispatchDate: string;
  truckNumber: string;
  driverMobile: string | null;
  manualGatePassNumber: string | null;
  weightSlipNumber: string | null;
  grossWeight: string | number | null;
  tareWeight: string | number | null;
  netWeight: string | number | null;
  remarks: string | null;
  createdById: string;
  dispatchRequisitions: CreatedSeedDispatchRequisition[];
};

export type SeedDispatchCreateResponse = {
  success: boolean;
  data: CreatedSeedDispatch;
};
