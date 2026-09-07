import { createFileRoute } from '@tanstack/react-router';
import FarmerContractDetailPage from '@/features/farmer-profile/components/FarmerContractDetailPage';

export const Route = createFileRoute('/_authenticated/farmers/$id/contract/$contractId')({
  component: FarmerContractDetailPage,
});
