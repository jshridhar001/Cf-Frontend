import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import FarmerProfilePage from '@/features/farmer-profile/components/FarmerProfilePage';
import {
  DEFAULT_PROFILE_TAB,
  FARMER_PROFILE_TAB_VALUES,
} from '@/features/farmer-profile/profile-tabs';

const farmerProfileSearchSchema = z.object({
  tab: z.enum(FARMER_PROFILE_TAB_VALUES).optional().catch(undefined),
});

export const Route = createFileRoute('/_authenticated/farmers/$id')({
  validateSearch: farmerProfileSearchSchema,
  component: FarmerProfileRoute,
});

function FarmerProfileRoute() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <FarmerProfilePage
      id={id}
      tab={tab ?? DEFAULT_PROFILE_TAB}
      onTabChange={(nextTab) => {
        void navigate({
          search: nextTab === DEFAULT_PROFILE_TAB ? {} : { tab: nextTab },
          replace: true,
        });
      }}
    />
  );
}
