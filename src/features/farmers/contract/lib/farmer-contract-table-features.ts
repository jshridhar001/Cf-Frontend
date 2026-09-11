import {
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
} from '@tanstack/react-table';

export const farmerContractTableFeatures = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

export type FarmerContractTableFeatures = typeof farmerContractTableFeatures;
