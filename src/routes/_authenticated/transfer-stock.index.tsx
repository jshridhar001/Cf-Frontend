import { createFileRoute } from '@tanstack/react-router';
import { TransferStockOverviewPage } from '@/features/transfer-stock/overview/components/TransferStockOverviewPage';

export const Route = createFileRoute('/_authenticated/transfer-stock/')({
  component: TransferStockOverviewPage,
});
