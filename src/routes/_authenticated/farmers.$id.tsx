import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/farmers/$id')({
  component: FarmerIdLayout,
});

function FarmerIdLayout() {
  return <Outlet />;
}
