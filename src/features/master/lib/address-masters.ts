export const addressMasters = {
  states: {
    path: '/v1/masters/states',
    title: 'States',
    singularTitle: 'State',
    singular: 'state',
    plural: 'states',
    description: 'Manage the states used across addresses.',
  },
  districts: {
    path: '/v1/masters/districts',
    title: 'Districts',
    singularTitle: 'District',
    singular: 'district',
    plural: 'districts',
    description: 'Manage the districts used across addresses.',
  },
  stations: {
    path: '/v1/masters/stations',
    title: 'Stations',
    singularTitle: 'Station',
    singular: 'station',
    plural: 'stations',
    description: 'Manage the stations used across addresses.',
  },
  'police-stations': {
    path: '/v1/masters/police-stations',
    title: 'Police Stations',
    singularTitle: 'Police Station',
    singular: 'police station',
    plural: 'police stations',
    description: 'Manage the police stations used across addresses.',
  },
  pincodes: {
    path: '/v1/masters/pincodes',
    title: 'Pincodes',
    singularTitle: 'Pincode',
    singular: 'pincode',
    plural: 'pincodes',
    description: 'Manage the pincodes used across addresses.',
  },
  'post-offices': {
    path: '/v1/masters/post-offices',
    title: 'Post Offices',
    singularTitle: 'Post Office',
    singular: 'post office',
    plural: 'post offices',
    description: 'Manage the post offices used across addresses.',
  },
  villages: {
    path: '/v1/masters/villages',
    title: 'Villages',
    singularTitle: 'Village',
    singular: 'village',
    plural: 'villages',
    description: 'Manage the villages used across addresses.',
  },
} as const;

export type AddressMasterId = keyof typeof addressMasters;

export const addressMasterIds = Object.keys(addressMasters) as AddressMasterId[];

export function getAddressMaster(id: AddressMasterId) {
  return addressMasters[id];
}
