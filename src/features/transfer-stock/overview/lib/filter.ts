import type { StockTransfer, StockTransferStatus } from '@/features/transfer-stock/overview/types';

export type TransferStatusFilter = StockTransferStatus | 'all';

export function filterStockTransfers(
  transfers: StockTransfer[],
  query: string,
  status: TransferStatusFilter,
) {
  const normalized = query.trim().toLowerCase();

  return transfers
    .filter((transfer) => {
      if (status !== 'all' && transfer.status !== status) return false;
      if (!normalized) return true;
      const haystack = [
        transfer.fromFarmer.name,
        transfer.fromFarmer.accountNumber,
        transfer.toFarmer.name,
        transfer.toFarmer.accountNumber,
        transfer.truckNumber,
        transfer.toLocation,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    })
    .sort((a, b) => {
      const aTime = Date.parse(a.transferDate ?? a.createdAt);
      const bTime = Date.parse(b.transferDate ?? b.createdAt);
      return bTime - aTime;
    });
}
