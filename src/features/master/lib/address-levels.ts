import { z } from 'zod';
import type { AddressEntity } from '@/features/master/types/addresses';

export const ADDRESS_LEVELS = [
  'states',
  'districts',
  'post-offices',
  'police-stations',
  'villages',
  'areas',
] as const;

export type AddressLevel = (typeof ADDRESS_LEVELS)[number];

export type CascadeIdField =
  | 'stateId'
  | 'districtId'
  | 'postOfficeId'
  | 'policeStationId'
  | 'villageId';

export type CascadeValues = Record<CascadeIdField, string>;

export type AddressLevelConfig = {
  id: AddressLevel;
  label: string;
  singular: string;
  path: string;
  idField: CascadeIdField;
  parentLevel: AddressLevel | null;
  parentFk: CascadeIdField | null;
  parentLabel: string | null;
  hasPincode: boolean;
  showPath: boolean;
  descendants: string;
};

export const ADDRESS_LEVEL_CONFIG: Record<AddressLevel, AddressLevelConfig> = {
  states: {
    id: 'states',
    label: 'States',
    singular: 'State',
    path: '/v1/masters/states',
    idField: 'stateId',
    parentLevel: null,
    parentFk: null,
    parentLabel: null,
    hasPincode: false,
    showPath: false,
    descendants: 'districts, post offices, police stations, villages, and areas',
  },
  districts: {
    id: 'districts',
    label: 'Districts',
    singular: 'District',
    path: '/v1/masters/districts',
    idField: 'districtId',
    parentLevel: 'states',
    parentFk: 'stateId',
    parentLabel: 'State',
    hasPincode: false,
    showPath: false,
    descendants: 'post offices, police stations, villages, and areas',
  },
  'post-offices': {
    id: 'post-offices',
    label: 'Post Offices',
    singular: 'Post Office',
    path: '/v1/masters/post-offices',
    idField: 'postOfficeId',
    parentLevel: 'districts',
    parentFk: 'districtId',
    parentLabel: 'District',
    hasPincode: true,
    showPath: false,
    descendants: 'police stations, villages, and areas',
  },
  'police-stations': {
    id: 'police-stations',
    label: 'Police Stations',
    singular: 'Police Station',
    path: '/v1/masters/police-stations',
    idField: 'policeStationId',
    parentLevel: 'post-offices',
    parentFk: 'postOfficeId',
    parentLabel: 'Post Office',
    hasPincode: false,
    showPath: false,
    descendants: 'villages and areas',
  },
  villages: {
    id: 'villages',
    label: 'Villages',
    singular: 'Village',
    path: '/v1/masters/villages',
    idField: 'villageId',
    parentLevel: 'police-stations',
    parentFk: 'policeStationId',
    parentLabel: 'Police Station',
    hasPincode: false,
    showPath: false,
    descendants: 'areas',
  },
  areas: {
    id: 'areas',
    label: 'Areas',
    singular: 'Area',
    path: '/v1/masters/areas',
    idField: 'villageId',
    parentLevel: 'villages',
    parentFk: 'villageId',
    parentLabel: 'Village',
    hasPincode: false,
    showPath: true,
    descendants: '',
  },
};

export const emptyCascade = (): CascadeValues => ({
  stateId: '',
  districtId: '',
  postOfficeId: '',
  policeStationId: '',
  villageId: '',
});

export function getAncestorLevels(level: AddressLevel): AddressLevel[] {
  const index = ADDRESS_LEVELS.indexOf(level);
  return ADDRESS_LEVELS.slice(0, index);
}

export function getAddressParentName(level: AddressLevel, entity: AddressEntity): string | null {
  switch (level) {
    case 'states':
      return null;
    case 'districts':
      return 'state' in entity ? (entity.state?.name ?? null) : null;
    case 'post-offices':
      return 'district' in entity ? (entity.district?.name ?? null) : null;
    case 'police-stations':
      return 'postOffice' in entity ? (entity.postOffice?.name ?? null) : null;
    case 'villages':
      return 'policeStation' in entity ? (entity.policeStation?.name ?? null) : null;
    case 'areas':
      return 'village' in entity ? (entity.village?.name ?? null) : null;
  }
}

export function getAddressPincode(entity: AddressEntity): string | null {
  return 'pincode' in entity && typeof entity.pincode === 'string' ? entity.pincode : null;
}

export function getAddressPath(entity: AddressEntity): string | null {
  if (!('village' in entity)) return null;

  const village = entity.village;
  const policeStation = village?.policeStation;
  const postOffice = policeStation?.postOffice;
  const district = postOffice?.district;
  const state = district?.state;
  if (!village || !policeStation || !postOffice || !district || !state) return null;

  const pincode = postOffice.pincode ? ` (${postOffice.pincode})` : '';
  return [
    state.name,
    district.name,
    `${postOffice.name}${pincode}`,
    policeStation.name,
    village.name,
  ].join(' · ');
}

export type AddressFormValues = CascadeValues & {
  name: string;
  pincode: string;
};

export function buildAddressPayload(level: AddressLevel, values: AddressFormValues) {
  const name = values.name.trim();

  switch (level) {
    case 'states':
      return { name };
    case 'districts':
      return { name, stateId: values.stateId };
    case 'post-offices':
      return { name, pincode: values.pincode.trim(), districtId: values.districtId };
    case 'police-stations':
      return { name, postOfficeId: values.postOfficeId };
    case 'villages':
      return { name, policeStationId: values.policeStationId };
    case 'areas':
      return { name, villageId: values.villageId };
  }
}

export const addressSearchSchema = z.object({
  tab: z.enum(ADDRESS_LEVELS).optional().catch('states'),
  create: z
    .union([z.literal(true), z.literal(false), z.literal('true'), z.literal('false')])
    .optional()
    .transform((value) => (value === true || value === 'true' ? true : undefined)),
  parentId: z.string().uuid().optional().catch(undefined),
});
