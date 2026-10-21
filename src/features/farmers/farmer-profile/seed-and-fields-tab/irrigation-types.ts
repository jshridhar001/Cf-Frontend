export type IrrigationFieldSummary = {
  id: string;
  name: string;
  acres: string;
  farmerId: string;
};

export type IrrigationOfficerSummary = {
  id: string;
  name: string;
  email: string;
};

export type Irrigation = {
  id: string;
  fieldId: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  mediaUrls: string[] | null;
  remarks: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  field: IrrigationFieldSummary;
  createdBy: IrrigationOfficerSummary;
};

export type IrrigationsResponse = {
  success: boolean;
  data: Irrigation[];
};

export type IrrigationResponse = {
  success: boolean;
  data: Irrigation;
};

export type CreateIrrigationInput = {
  fieldId: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  remarks?: string;
  mediaUrls?: string[];
};

export type UpdateIrrigationInput = {
  id: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  remarks: string | null;
  mediaUrls: string[] | null;
};

export type IrrigationMessageResponse = {
  success: boolean;
  message: string;
};
