import { createFileRoute } from '@tanstack/react-router';
import FarmerProfilePage from '@/features/farmer-profile/components/FarmerProfilePage';

export const Route = createFileRoute('/_authenticated/farmers/$id')({
  component: FarmerProfileRoute,
});

function FarmerProfileRoute() {
  const { id } = Route.useParams();
  return <FarmerProfilePage id={id} />;
}
