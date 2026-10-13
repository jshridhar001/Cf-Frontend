import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/transfer-stock')({
  component: TransferStockLayout,
});

function TransferStockLayout() {
  return <Outlet />;
}
