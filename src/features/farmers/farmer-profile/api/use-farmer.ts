import { useQuery } from '@tanstack/react-query';
import { farmersQueryOptions } from '@/features/farmers/overview/api/use-farmers';

export function useFarmer(id: string) {
  return useQuery({
    ...farmersQueryOptions(),
    select: (farmers) => farmers.find((farmer) => farmer.id === id) ?? null,
  });
}
