import { createFileRoute } from '@tanstack/react-router';
import { CreateTransferStockPage } from '@/features/transfer-stock/create/components/CreateTransferStockPage';

export const Route = createFileRoute('/_authenticated/transfer-stock/create')({
  component: CreateTransferStockPage,
});
