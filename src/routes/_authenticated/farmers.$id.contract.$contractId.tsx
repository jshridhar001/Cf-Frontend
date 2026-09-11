import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import FarmerContractDetailPage from '@/features/farmers/contract/components/FarmerContractDetailPage';
import { CONTRACT_LANGUAGES } from '@/features/farmers/contract/lib/contract-language';
import { farmerQueryOptions } from '@/features/farmers/profile/api/use-farmer';

const contractDetailSearchSchema = z.object({
  lang: z.enum(CONTRACT_LANGUAGES).default('english').catch('english'),
});

export const Route = createFileRoute('/_authenticated/farmers/$id/contract/$contractId')({
  validateSearch: contractDetailSearchSchema,
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(farmerQueryOptions(params.id));
    } catch {
      // Query error stays in cache; the page renders farmer not-found / error UI.
    }
  },
  component: FarmerContractDetailRoute,
});

function FarmerContractDetailRoute() {
  const { id, contractId } = Route.useParams();
  const { lang } = Route.useSearch();
  return <FarmerContractDetailPage id={id} contractId={contractId} lang={lang} />;
}
