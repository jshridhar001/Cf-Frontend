import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { stockTransferKeys } from '@/features/transfer-stock/overview/api/query-keys';
import type { StockTransferResponse } from '@/features/transfer-stock/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useNullifyStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['stock-transfer', 'nullify'],
    mutationFn: async (transferId: string) => {
      const { data } = await apiClient.patch<StockTransferResponse>(
        `/v1/stock-transfers/${transferId}/nullify`,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (transfer) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: stockTransferKeys.list() }),
        queryClient.invalidateQueries({ queryKey: stockTransferKeys.detail(transfer.id) }),
        queryClient.invalidateQueries({
          queryKey: stockTransferKeys.farmerStock(transfer.fromFarmerId),
        }),
        queryClient.invalidateQueries({
          queryKey: stockTransferKeys.farmerStock(transfer.toFarmerId),
        }),
      ]);
      toast.success('Transfer nullified', {
        description: transfer.truckNumber?.trim()
          ? `Truck ${transfer.truckNumber.trim()}`
          : undefined,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to nullify transfer. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
