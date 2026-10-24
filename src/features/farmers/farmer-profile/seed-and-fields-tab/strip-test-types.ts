export const STRIP_TEST_TYPES = ['PRE_DEHAULMING', 'POST_DEHAULMING'] as const;

export type StripTestType = (typeof STRIP_TEST_TYPES)[number];

export function stripTestTypeLabel(type: StripTestType) {
  return type === 'PRE_DEHAULMING' ? 'Pre-dehaulming' : 'Post-dehaulming';
}

export function isStripTestType(value: string): value is StripTestType {
  return value === 'PRE_DEHAULMING' || value === 'POST_DEHAULMING';
}

export type StripTestFieldSummary = {
  id: string;
  name: string;
  acres: string;
  farmerId: string;
};

export type StripTestOfficerSummary = {
  id: string;
  name: string;
  email: string;
};

export type StripTestTuberSize = {
  id: string;
  name: string;
};

export type StripTestTuberRecord = {
  id: string;
  stripTestId: string;
  tuberSizeId: string;
  quantity: number;
  weightKg: string;
  tuberSize: StripTestTuberSize;
};

export type StripTest = {
  id: string;
  groupId: string;
  fieldId: string;
  type: StripTestType;
  startDate: string;
  endDate: string;
  stripLength: string;
  stripWidth: string;
  numberOfPlants: number;
  stemsPerPlant: number | null;
  mediaUrls: string[] | null;
  remarks: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  tuberRecords: StripTestTuberRecord[];
};

export type StripTestGroup = {
  id: string;
  fieldId: string;
  name: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  field: StripTestFieldSummary;
  createdBy: StripTestOfficerSummary;
  stripTests: StripTest[];
};

export type StripTestGroupsResponse = {
  success: boolean;
  data: StripTestGroup[];
};

export type StripTestGroupResponse = {
  success: boolean;
  data: StripTestGroup;
};

export type StripTestTuberRecordInput = {
  tuberSizeId: string;
  quantity: number;
  weightKg: number;
};

export type StripTestInput = {
  fieldId: string;
  type: StripTestType;
  startDate: string;
  endDate: string;
  stripLength: number;
  stripWidth: number;
  numberOfPlants: number;
  stemsPerPlant?: number;
  mediaUrls?: string[];
  remarks?: string;
  tuberRecords: StripTestTuberRecordInput[];
};

export type CreateStripTestGroupInput = {
  fieldId: string;
  name: string;
  stripTests: StripTestInput[];
};

export type UpdateStripTestGroupInput = CreateStripTestGroupInput & {
  id: string;
};

export type StripTestGroupMessageResponse = {
  success: boolean;
  message: string;
};
