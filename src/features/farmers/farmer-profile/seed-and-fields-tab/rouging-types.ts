export type RougingFieldSummary = {
  id: string;
  name: string;
  acres: string;
  farmerId: string;
};

export type RougingOfficerSummary = {
  id: string;
  name: string;
  email: string;
};

export type Rouging = {
  id: string;
  fieldId: string;
  startDate: string;
  endDate: string;
  virusInfectedPlantsRemoved: string | null;
  offVarietyTypeRemoval: string | null;
  mediaUrls: string[] | null;
  remarks: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  field: RougingFieldSummary;
  createdBy: RougingOfficerSummary;
};

export type RougingsResponse = {
  success: boolean;
  data: Rouging[];
};

export type RougingResponse = {
  success: boolean;
  data: Rouging;
};

export type CreateRougingInput = {
  fieldId: string;
  startDate: string;
  endDate: string;
  virusInfectedPlantsRemoved?: number;
  offVarietyTypeRemoval?: number;
  remarks?: string;
  mediaUrls?: string[];
};

export type UpdateRougingInput = {
  id: string;
  startDate: string;
  endDate: string;
  virusInfectedPlantsRemoved: number | null;
  offVarietyTypeRemoval: number | null;
  remarks: string | null;
  mediaUrls: string[] | null;
};

export type RougingMessageResponse = {
  success: boolean;
  message: string;
};
