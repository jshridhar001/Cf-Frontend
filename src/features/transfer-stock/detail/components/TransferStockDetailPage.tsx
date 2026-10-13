import { isAxiosError } from 'axios';
import { TransferStockDetailSkeleton } from '@/features/transfer-stock/detail/components/transfer-stock-detail-skeleton';
import { TransferStockDetailView } from '@/features/transfer-stock/detail/components/transfer-stock-detail-view';
import { useStockTransfer } from '@/features/transfer-stock/overview/api/use-stock-transfer';
import { getApiErrorMessage } from '@/lib/api-client';

type TransferStockDetailPageProps = {
  id: string;
};

export function TransferStockDetailPage({ id }: TransferStockDetailPageProps) {
  const { data, isPending, isError, error } = useStockTransfer(id);

  if (isPending) {
    return <TransferStockDetailSkeleton />;
  }

  if (isError || !data) {
    const notFound = isAxiosError(error) && error.response?.status === 404;
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm">
        {notFound ? 'Transfer not found.' : getApiErrorMessage(error, 'Failed to load transfer.')}
      </div>
    );
  }

  return <TransferStockDetailView transfer={data} />;
}
