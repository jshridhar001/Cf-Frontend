import { createFileRoute } from '@tanstack/react-router';
import { useFarmer } from '@/features/farmers/farmer-profile/api/use-farmer';
import { FarmerSeedDispatchTab } from '@/features/farmers/farmer-profile/seed-dispatch-tab/components/farmer-seed-dispatch-tab';

export const Route = createFileRoute('/_authenticated/farmers/$id/dispatches')({
  component: FarmerDispatchesRoute,
});

function FarmerDispatchesRoute() {
  const { id } = Route.useParams();
  const { data: farmer } = useFarmer(id);
  if (!farmer) return null;
  return <FarmerSeedDispatchTab farmer={farmer} />;
}
