import { useQuery } from '@tanstack/react-query';
import { farmerContractsQueryOptions } from '@/features/farmers/api/use-farmer-contracts';

export function useFarmerContract(farmerId: string, contractId: string) {
  return useQuery({
    ...farmerContractsQueryOptions(farmerId),
    enabled: farmerId.length > 0 && contractId.length > 0,
    select: (contracts) => contracts.find((contract) => contract.id === contractId) ?? null,
  });
}
