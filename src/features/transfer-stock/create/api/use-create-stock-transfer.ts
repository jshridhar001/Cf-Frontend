import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { toCreateStockTransferBody } from '@/features/transfer-stock/create/lib/to-create-transfer-body';
import type { CreateTransferInput } from '@/features/transfer-stock/create/lib/transfer.schema';
import { stockTransferKeys } from '@/features/transfer-stock/overview/api/query-keys';
import type { StockTransferResponse } from '@/features/transfer-stock/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useCreateStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['stock-transfer', 'create'],
    mutationFn: async (variables: CreateTransferInput) => {
      const body = toCreateStockTransferBody(variables);
      const { data } = await apiClient.post<StockTransferResponse>('/v1/stock-transfers', body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (transfer) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: stockTransferKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: stockTransferKeys.farmerStock(transfer.fromFarmerId),
        }),
      ]);
      toast.success('Transfer created', {
        description: `Truck ${transfer.truckNumber} — ${transfer.toLocation}`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create transfer. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
