import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import FarmerProfilePage from '@/features/farmers/profile/components/FarmerProfilePage';
import { FARMER_PROFILE_TABS } from '@/features/farmers/profile/lib/farmer-profile-tabs';

const farmerProfileSearchSchema = z.object({
  tab: z.enum(FARMER_PROFILE_TABS).default('contract').catch('contract'),
});

export const Route = createFileRoute('/_authenticated/farmers/$id/')({
  validateSearch: farmerProfileSearchSchema,
  component: FarmerProfileRoute,
});

function FarmerProfileRoute() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  return <FarmerProfilePage id={id} tab={tab} />;
}
