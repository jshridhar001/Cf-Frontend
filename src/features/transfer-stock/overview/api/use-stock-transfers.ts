import { queryOptions, useQuery } from '@tanstack/react-query';
import { stockTransferKeys } from '@/features/transfer-stock/overview/api/query-keys';
import type {
  StockTransfer,
  StockTransfersResponse,
} from '@/features/transfer-stock/overview/types';
import apiClient from '@/lib/api-client';

async function fetchStockTransfers(): Promise<StockTransfer[]> {
  const { data } = await apiClient.get<StockTransfersResponse>('/v1/stock-transfers');
  return data.data;
}

export function stockTransfersQueryOptions() {
  return queryOptions({
    queryKey: stockTransferKeys.list(),
    queryFn: fetchStockTransfers,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useStockTransfers() {
  return useQuery(stockTransfersQueryOptions());
}
