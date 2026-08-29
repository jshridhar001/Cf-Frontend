export type Variety = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type VarietiesResponse = {
  success: boolean;
  data: Variety[];
};

export type VarietyResponse = {
  success: boolean;
  data: Variety;
};

export type VarietyMessageResponse = {
  success: boolean;
  message: string;
};

export type Generation = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type GenerationsResponse = {
  success: boolean;
  data: Generation[];
};

export type GenerationResponse = {
  success: boolean;
  data: Generation;
};

export type GenerationMessageResponse = {
  success: boolean;
  message: string;
};

export type SeedSize = {
  id: string;
  name: string;
  seedBagsPerAcre: number | null;
  createdAt: string;
  updatedAt: string;
};

export type SeedSizesResponse = {
  success: boolean;
  data: SeedSize[];
};

export type SeedSizeResponse = {
  success: boolean;
  data: SeedSize;
};

export type SeedSizeMessageResponse = {
  success: boolean;
  message: string;
};

export const FACILITY_USED_IN_VALUES = ['SEED-REQUISITION', 'SEED-DISPATCH', 'FIELD-STEP'] as const;

export type FacilityUsedIn = (typeof FACILITY_USED_IN_VALUES)[number];

export type Facility = {
  id: string;
  name: string;
  usedIn: FacilityUsedIn;
  totalBagsDispatched: number;
  createdAt: string;
  updatedAt: string;
};

export type FacilitiesResponse = {
  success: boolean;
  data: Facility[];
};

export type FacilityResponse = {
  success: boolean;
  data: Facility;
};

export type FacilityMessageResponse = {
  success: boolean;
  message: string;
};

export type TuberSize = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type TuberSizesResponse = {
  success: boolean;
  data: TuberSize[];
};

export type TuberSizeResponse = {
  success: boolean;
  data: TuberSize;
};

export type TuberSizeMessageResponse = {
  success: boolean;
  message: string;
};

export type Locality = {
  id: string;
  name: string;
  stationId: string;
  createdAt: string;
  updatedAt: string;
};

export type StationRecord = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Station = StationRecord & {
  localities: Locality[];
};

export type StationsResponse = {
  success: boolean;
  data: Station[];
};

export type StationResponse = {
  success: boolean;
  data: StationRecord;
};

export type StationMessageResponse = {
  success: boolean;
  message: string;
};

export type LocalitiesResponse = {
  success: boolean;
  data: Locality[];
};

export type LocalityResponse = {
  success: boolean;
  data: Locality;
};

export type LocalityMessageResponse = {
  success: boolean;
  message: string;
};
