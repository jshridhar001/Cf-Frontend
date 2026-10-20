import { createFileRoute } from '@tanstack/react-router';
import { useFarmer } from '@/features/farmers/farmer-profile/api/use-farmer';
import { FarmerSeedAndFieldsTab } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/farmer-seed-and-fields-tab';

export const Route = createFileRoute('/_authenticated/farmers/$id/fields/')({
  component: FarmerFieldsRoute,
});

function FarmerFieldsRoute() {
  const { id } = Route.useParams();
  const { data: farmer } = useFarmer(id);
  if (!farmer) return null;
  return <FarmerSeedAndFieldsTab farmer={farmer} />;
}
