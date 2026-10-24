export type DehaulmingFieldSummary = {
  id: string;
  name: string;
  acres: string;
  farmerId: string;
};

export type DehaulmingOfficerSummary = {
  id: string;
  name: string;
  email: string;
};

export type Dehaulming = {
  id: string;
  fieldId: string;
  startDate: string;
  endDate: string;
  mediaUrls: string[] | null;
  remarks: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  field: DehaulmingFieldSummary;
  createdBy: DehaulmingOfficerSummary;
};

export type DehaulmingsResponse = {
  success: boolean;
  data: Dehaulming[];
};

export type DehaulmingResponse = {
  success: boolean;
  data: Dehaulming;
};

export type CreateDehaulmingInput = {
  fieldId: string;
  startDate: string;
  endDate: string;
  remarks?: string;
  mediaUrls?: string[];
};

export type UpdateDehaulmingInput = {
  id: string;
  startDate: string;
  endDate: string;
  remarks: string | null;
  mediaUrls: string[] | null;
};

export type DehaulmingMessageResponse = {
  success: boolean;
  message: string;
};
