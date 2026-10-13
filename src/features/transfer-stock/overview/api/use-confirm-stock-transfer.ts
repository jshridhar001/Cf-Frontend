import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { stockTransferKeys } from '@/features/transfer-stock/overview/api/query-keys';
import type { StockTransferResponse } from '@/features/transfer-stock/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useConfirmStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['stock-transfer', 'confirm'],
    mutationFn: async (transferId: string) => {
      const { data } = await apiClient.post<StockTransferResponse>(
        `/v1/stock-transfers/${transferId}/confirm`,
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
      toast.success('Transfer confirmed', {
        description: `${transfer.fromFarmer.name} → ${transfer.toFarmer.name}`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to confirm transfer. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
