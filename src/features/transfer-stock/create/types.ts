export type FarmerStockVariety = {
  id: string;
  name: string;
};

export type FarmerStockSize = {
  id: string;
  name: string;
  seedBagsPerAcre?: number;
};

export type FarmerStockGeneration = {
  id: string;
  name: string;
};

export type FarmerStockRow = {
  id: string;
  farmerId: string;
  varietyId: string;
  sizeId: string;
  generationId: string;
  balance: string;
  variety: FarmerStockVariety;
  size: FarmerStockSize;
  generation: FarmerStockGeneration;
};

export type FarmerStockResponse = {
  success: boolean;
  data: FarmerStockRow[];
};

export type CreateStockTransferLineBody = {
  varietyId: string;
  sizeId: string;
  generationId: string;
  bagQuantity: number;
};

export type CreateStockTransferBody = {
  fromFarmerId: string;
  toFarmerId: string;
  toLocation: string;
  truckNumber: string;
  transferDate?: string;
  driverMobile?: string;
  manualGatePassNumber?: string;
  weightSlipNumber?: string;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;
  remarks?: string;
  lines: CreateStockTransferLineBody[];
};
