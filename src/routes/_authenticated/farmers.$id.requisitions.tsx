import { createFileRoute } from '@tanstack/react-router';
import { useFarmer } from '@/features/farmers/farmer-profile/api/use-farmer';
import { FarmerSeedRequisitionTab } from '@/features/farmers/farmer-profile/seed-requisition-tab/components/farmer-seed-requisition-tab';

export const Route = createFileRoute('/_authenticated/farmers/$id/requisitions')({
  component: FarmerRequisitionsRoute,
});

function FarmerRequisitionsRoute() {
  const { id } = Route.useParams();
  const { data: farmer } = useFarmer(id);
  if (!farmer) return null;
  return <FarmerSeedRequisitionTab farmer={farmer} />;
}
