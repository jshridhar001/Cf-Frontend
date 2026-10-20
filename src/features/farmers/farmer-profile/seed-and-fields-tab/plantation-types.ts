export type PlantationSummary = {
  id: string;
  name: string;
};

export type PlantationFieldSummary = PlantationSummary & {
  acres: string;
  farmerId: string;
};

export type PlantationRequisitionSummary = {
  id: string;
  status: string;
};

export type PlantationOfficerSummary = {
  id: string;
  name: string;
  email: string;
};

export type Plantation = {
  id: string;
  fieldId: string;
  varietyId: string;
  sizeId: string;
  bagCount: number;
  acresPlanted: string;
  startDate: string;
  endDate: string | null;
  requisitionId: string | null;
  mediaUrls: string[] | null;
  remarks: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  field: PlantationFieldSummary;
  variety: PlantationSummary;
  size: PlantationSummary;
  requisition: PlantationRequisitionSummary | null;
  createdBy: PlantationOfficerSummary;
};

export type PlantationsResponse = {
  success: boolean;
  data: Plantation[];
};

export type PlantationResponse = {
  success: boolean;
  data: Plantation;
};

export type CreatePlantationInput = {
  fieldId: string;
  varietyId: string;
  sizeId: string;
  bagCount: number;
  acresPlanted: number;
  startDate: string;
  endDate: string;
  remarks?: string;
  mediaUrls?: string[];
};

export type UpdatePlantationInput = {
  id: string;
  varietyId: string;
  sizeId: string;
  bagCount: number;
  acresPlanted: number;
  startDate: string;
  endDate: string;
  remarks: string | null;
  mediaUrls: string[] | null;
};

export type PlantationMessageResponse = {
  success: boolean;
  message: string;
};
