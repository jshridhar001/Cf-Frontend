import { useQuery } from '@tanstack/react-query';
import { farmerQueryOptions } from '@/features/farmers/api/use-farmer';

export function useFarmerContract(farmerId: string, contractId: string) {
  return useQuery({
    ...farmerQueryOptions(farmerId),
    enabled: farmerId.length > 0 && contractId.length > 0,
    select: (farmer) => farmer.contracts?.find((contract) => contract.id === contractId) ?? null,
  });
}
