export type LatLngTuple = [number, number];

export type FieldFarmerSummary = {
  id: string;
  name: string;
  accountNumber: string;
};

export type FieldOfficerSummary = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type FarmerField = {
  id: string;
  farmerId: string;
  name: string;
  geoLocation: string | null;
  acres: string;
  assignedOfficerId: string;
  createdAt: string;
  updatedAt: string;
  farmer?: FieldFarmerSummary | null;
  assignedOfficer?: FieldOfficerSummary | null;
};

export type FieldsListResponse = {
  success: boolean;
  data: FarmerField[];
};

export type FieldResponse = {
  success: boolean;
  data: FarmerField;
};

export type CreateFieldInput = {
  farmerId: string;
  name: string;
  acres: string;
  assignedOfficerId: string;
  geoLocation?: string;
};

export type UpdateFieldInput = {
  farmerId?: string;
  name?: string;
  acres?: string;
  assignedOfficerId?: string;
  geoLocation?: string | null;
};

export type FieldMessageResponse = {
  success: boolean;
  message: string;
};
