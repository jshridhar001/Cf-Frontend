import { createFileRoute } from '@tanstack/react-router';
import FarmerContractPage from '@/features/farmers/contract/components/FarmerContractPage';

export const Route = createFileRoute('/_authenticated/farmers/contract')({
  component: FarmerContractPage,
});
