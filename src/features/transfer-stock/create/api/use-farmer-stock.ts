import { queryOptions, useQuery } from '@tanstack/react-query';
import type { FarmerStockResponse, FarmerStockRow } from '@/features/transfer-stock/create/types';
import { stockTransferKeys } from '@/features/transfer-stock/overview/api/query-keys';
import apiClient from '@/lib/api-client';

async function fetchFarmerStock(farmerId: string): Promise<FarmerStockRow[]> {
  const { data } = await apiClient.get<FarmerStockResponse>(`/v1/farmers/${farmerId}/stock`);
  return data.data;
}

export function farmerStockQueryOptions(farmerId: string) {
  return queryOptions({
    queryKey: stockTransferKeys.farmerStock(farmerId),
    queryFn: () => fetchFarmerStock(farmerId),
    staleTime: 1000 * 30,
    retry: false,
    enabled: Boolean(farmerId),
  });
}

export function useFarmerStock(farmerId: string) {
  return useQuery(farmerStockQueryOptions(farmerId));
}
