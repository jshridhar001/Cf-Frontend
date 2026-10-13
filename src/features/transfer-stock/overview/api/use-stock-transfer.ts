import { queryOptions, useQuery } from '@tanstack/react-query';
import { stockTransferKeys } from '@/features/transfer-stock/overview/api/query-keys';
import type {
  StockTransfer,
  StockTransferResponse,
} from '@/features/transfer-stock/overview/types';
import apiClient from '@/lib/api-client';

async function fetchStockTransfer(id: string): Promise<StockTransfer> {
  const { data } = await apiClient.get<StockTransferResponse>(`/v1/stock-transfers/${id}`);
  return data.data;
}

export function stockTransferQueryOptions(id: string) {
  return queryOptions({
    queryKey: stockTransferKeys.detail(id),
    queryFn: () => fetchStockTransfer(id),
    staleTime: 1000 * 30,
    retry: false,
    enabled: Boolean(id),
  });
}

export function useStockTransfer(id: string) {
  return useQuery(stockTransferQueryOptions(id));
}
