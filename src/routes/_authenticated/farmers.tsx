import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/farmers')({
  beforeLoad: ({ location }) => {
    if (location.pathname === '/farmers' || location.pathname === '/farmers/') {
      throw redirect({ to: '/farmers/overview' });
    }
  },
  component: FarmersLayout,
});

function FarmersLayout() {
  return <Outlet />;
}
