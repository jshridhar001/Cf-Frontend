import type { Farmer, FarmerArea, FarmerFamily } from '@/features/farmers/overview/types';

type PlaceInput = {
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  postOfficeId: string;
  postOfficeName: string;
  pincode: string;
  policeStationId: string;
  policeStationName: string;
  villageId: string;
  villageName: string;
  areaId: string;
  areaName: string;
};

type AddressOption = { id: string; name: string; parentId?: string };

function uniqueOptions(options: AddressOption[]) {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (seen.has(option.id)) return false;
    seen.add(option.id);
    return true;
  });
}

function place(input: PlaceInput): FarmerArea {
  return {
    id: input.areaId,
    name: input.areaName,
    villageId: input.villageId,
    village: {
      id: input.villageId,
      name: input.villageName,
      policeStationId: input.policeStationId,
      policeStation: {
        id: input.policeStationId,
        name: input.policeStationName,
        postOfficeId: input.postOfficeId,
        postOffice: {
          id: input.postOfficeId,
          name: input.postOfficeName,
          pincode: input.pincode,
          districtId: input.districtId,
          district: {
            id: input.districtId,
            name: input.districtName,
            stateId: input.stateId,
            state: {
              id: input.stateId,
              name: input.stateName,
            },
          },
        },
      },
    },
  };
}

const places: PlaceInput[] = [
  {
    stateId: 'state-up',
    stateName: 'Uttar Pradesh',
    districtId: 'dist-agra',
    districtName: 'Agra',
    postOfficeId: 'po-fatehabad',
    postOfficeName: 'Fatehabad',
    pincode: '283111',
    policeStationId: 'ps-fatehabad',
    policeStationName: 'Fatehabad',
    villageId: 'vil-rampur',
    villageName: 'Rampur',
    areaId: 'area-rampur-north',
    areaName: 'North field',
  },
  {
    stateId: 'state-rj',
    stateName: 'Rajasthan',
    districtId: 'dist-alwar',
    districtName: 'Alwar',
    postOfficeId: 'po-kishangarh',
    postOfficeName: 'Kishangarh',
    pincode: '301001',
    policeStationId: 'ps-kishangarh',
    policeStationName: 'Kishangarh',
    villageId: 'vil-khairpur',
    villageName: 'Khairpur',
    areaId: 'area-khairpur-east',
    areaName: 'East field',
  },
];

const rampurPlace = places[0];
const khairpurPlace = places[1];
if (!rampurPlace || !khairpurPlace) {
  throw new Error('Sample address places are missing.');
}
const rampur = place(rampurPlace);
const khairpur = place(khairpurPlace);

export const SAMPLE_ADDRESS_OPTIONS = {
  states: uniqueOptions(places.map((item) => ({ id: item.stateId, name: item.stateName }))),
  districts: uniqueOptions(
    places.map((item) => ({
      id: item.districtId,
      name: item.districtName,
      parentId: item.stateId,
    })),
  ),
  postOffices: uniqueOptions(
    places.map((item) => ({
      id: item.postOfficeId,
      name: item.postOfficeName,
      parentId: item.districtId,
    })),
  ),
  policeStations: uniqueOptions(
    places.map((item) => ({
      id: item.policeStationId,
      name: item.policeStationName,
      parentId: item.postOfficeId,
    })),
  ),
  villages: uniqueOptions(
    places.map((item) => ({
      id: item.villageId,
      name: item.villageName,
      parentId: item.policeStationId,
    })),
  ),
  areas: uniqueOptions(
    places.map((item) => ({ id: item.areaId, name: item.areaName, parentId: item.villageId })),
  ),
};

const singhFamily: FarmerFamily = {
  id: 'family-singh',
  name: 'Singh Family',
  accountNumber: 'FAM-2001',
  areaId: rampur.id,
  area: rampur,
};

export const SAMPLE_FARMERS: Farmer[] = [
  {
    id: 'farmer-ramesh',
    name: 'Ramesh Kumar',
    accountNumber: 'F-1001',
    mobileNumber: '9876543210',
    aadharNumber: '123456789012',
    panNumber: 'ABCDE1234F',
    accountType: 'INDIVIDUAL',
    status: 'ACTIVE',
    areaId: rampur.id,
    area: rampur,
    familyId: null,
    contractUrl: null,
    contracts: [{ id: 'contract-ramesh' }],
    bankName: 'State Bank of India',
    ifscCode: 'SBIN0001234',
    bankAccountNumber: '12345678901',
  },
  {
    id: 'farmer-sita',
    name: 'Sita Singh',
    accountNumber: 'F-1002',
    mobileNumber: '9811122233',
    aadharNumber: null,
    panNumber: null,
    accountType: 'FAMILY_PRIMARY',
    status: 'ACTIVE',
    areaId: rampur.id,
    area: rampur,
    familyId: singhFamily.id,
    family: singhFamily,
    familyName: singhFamily.name,
    familyAccountNumber: singhFamily.accountNumber,
    contractUrl: null,
    contracts: [{ id: 'contract-sita' }],
    bankName: 'Punjab National Bank',
    ifscCode: 'PUNB0123456',
    bankAccountNumber: '998877665544',
  },
  {
    id: 'farmer-amit',
    name: 'Amit Singh',
    accountNumber: 'F-1003',
    mobileNumber: '9900011122',
    aadharNumber: null,
    panNumber: null,
    accountType: 'FAMILY_MEMBER',
    status: 'ACTIVE',
    areaId: rampur.id,
    area: rampur,
    familyId: singhFamily.id,
    family: singhFamily,
    familyName: singhFamily.name,
    familyAccountNumber: singhFamily.accountNumber,
    contractUrl: null,
    contracts: [{ id: 'contract-amit' }],
    bankName: 'Punjab National Bank',
    ifscCode: 'PUNB0123456',
    bankAccountNumber: '112233445566',
  },
  {
    id: 'farmer-lakshmi',
    name: 'Lakshmi Rao',
    accountNumber: 'F-1004',
    mobileNumber: '9765432109',
    aadharNumber: null,
    panNumber: null,
    accountType: 'INDIVIDUAL',
    status: 'INACTIVE',
    areaId: khairpur.id,
    area: khairpur,
    familyId: null,
    contractUrl: null,
    contracts: [{ id: 'contract-lakshmi' }],
    bankName: 'Bank of Baroda',
    ifscCode: 'BARB0ALWAR1',
    bankAccountNumber: '556677889900',
  },
  {
    id: 'farmer-harpreet',
    name: 'Harpreet Kaur',
    accountNumber: 'F-1005',
    mobileNumber: '9654321098',
    aadharNumber: null,
    panNumber: null,
    accountType: 'INDIVIDUAL',
    status: 'ACTIVE',
    areaId: khairpur.id,
    area: khairpur,
    familyId: null,
    contractUrl: null,
    contracts: [{ id: 'contract-harpreet' }],
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0001234',
    bankAccountNumber: '334455667788',
  },
];

export function familiesFromFarmers(farmers: Farmer[]): FarmerFamily[] {
  const families = new Map<string, FarmerFamily>();
  for (const farmer of farmers) {
    if (farmer.family) families.set(farmer.family.id, farmer.family);
  }
  return [...families.values()];
}
