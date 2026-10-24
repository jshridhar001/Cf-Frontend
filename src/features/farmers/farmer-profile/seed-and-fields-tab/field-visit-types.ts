export type FieldVisitFieldSummary = {
  id: string;
  name: string;
  acres: string;
  farmerId: string;
};

export type FieldVisitOfficerSummary = {
  id: string;
  name: string;
  email: string;
};

export type FieldVisit = {
  id: string;
  fieldId: string;
  startDate: string;
  endDate: string;
  observations: string;
  mediaUrls: string[] | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  field: FieldVisitFieldSummary;
  createdBy: FieldVisitOfficerSummary;
};

export type FieldVisitsResponse = {
  success: boolean;
  data: FieldVisit[];
};

export type FieldVisitResponse = {
  success: boolean;
  data: FieldVisit;
};

export type CreateFieldVisitInput = {
  fieldId: string;
  startDate: string;
  endDate: string;
  observations: string;
  mediaUrls?: string[];
};

export type UpdateFieldVisitInput = {
  id: string;
  startDate: string;
  endDate: string;
  observations: string;
  mediaUrls: string[] | null;
};

export type FieldVisitMessageResponse = {
  success: boolean;
  message: string;
};
