import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { FarmerProfilePage } from '@/features/farmers/farmer-profile/components/FarmerProfilePage';
import { farmersQueryOptions } from '@/features/farmers/overview/api/use-farmers';

export const Route = createFileRoute('/_authenticated/farmers/$id')({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(farmersQueryOptions());
  },
  component: FarmerProfileLayout,
});

function FarmerProfileLayout() {
  const { id } = Route.useParams();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const fieldPath = `/farmers/${id}/fields/`;
  const fieldRest = pathname.startsWith(fieldPath)
    ? pathname.slice(fieldPath.length).replace(/\/$/, '')
    : '';
  const isFieldView = fieldRest.length > 0 && !fieldRest.includes('/');

  if (isFieldView) {
    return <Outlet />;
  }

  return <FarmerProfilePage id={id} />;
}
