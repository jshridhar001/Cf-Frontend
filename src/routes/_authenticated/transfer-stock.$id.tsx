import { createFileRoute } from '@tanstack/react-router';
import { TransferStockDetailPage } from '@/features/transfer-stock/detail/components/TransferStockDetailPage';
import { stockTransferQueryOptions } from '@/features/transfer-stock/overview/api/use-stock-transfer';

export const Route = createFileRoute('/_authenticated/transfer-stock/$id')({
  loader: ({ context, params }) => {
    void context.queryClient.prefetchQuery(stockTransferQueryOptions(params.id));
  },
  component: TransferStockDetailRoute,
});

function TransferStockDetailRoute() {
  const { id } = Route.useParams();
  return <TransferStockDetailPage id={id} />;
}
