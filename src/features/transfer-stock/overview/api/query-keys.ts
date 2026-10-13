export const stockTransferKeys = {
  all: ['stock-transfer'] as const,
  lists: () => [...stockTransferKeys.all, 'list'] as const,
  list: () => stockTransferKeys.lists(),
  details: () => [...stockTransferKeys.all, 'detail'] as const,
  detail: (id: string) => [...stockTransferKeys.details(), id] as const,
  farmerStocks: () => [...stockTransferKeys.all, 'farmer-stock'] as const,
  farmerStock: (farmerId: string) => [...stockTransferKeys.farmerStocks(), farmerId] as const,
};
