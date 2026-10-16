export type ColdStorageGatePass = {
  id: string;
  facilityId: string;
  gatePassDate: string;
  varietyId: string;
  generationId: string;
  sizeId: string;
  quantity: number;
  status: 'ACTIVE' | 'NULL';
  createdAt: string;
  updatedAt: string;
  facility: { id: string; name: string };
  variety: { id: string; name: string };
  generation: { id: string; name: string };
  size: { id: string; name: string };
};

export type ColdStorageGatePassesResponse = {
  success: boolean;
  data: ColdStorageGatePass[];
};

export type ColdStorageGatePassResponse = {
  success: boolean;
  data: ColdStorageGatePass;
};

export type ColdStorageGatePassMessageResponse = {
  success: boolean;
  message: string;
};
