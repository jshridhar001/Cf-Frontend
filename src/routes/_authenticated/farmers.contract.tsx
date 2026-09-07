import { createFileRoute } from '@tanstack/react-router';
import FarmerContractPage from '@/features/farmer-profile/components/FarmerContractPage';

export const Route = createFileRoute('/_authenticated/farmers/contract')({
  component: FarmerContractPage,
});
