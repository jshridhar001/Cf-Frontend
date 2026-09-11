import { useMemo } from 'react';

import { useFarmers } from '@/features/farmers/overview/api/use-farmers';
import { useVarieties } from '@/features/master/api/use-varieties';

export type SeedRequisitionFormOption = {
  value: string;
  label: string;
};

export type SeedRequisitionFormOptions = {
  farmers: SeedRequisitionFormOption[];
  varieties: SeedRequisitionFormOption[];
};

function farmerOptionLabel(name: string, accountNumber?: string | null) {
  return accountNumber ? `${name} (${accountNumber})` : name;
}

export function useSeedRequisitionFormOptions(seed?: {
  farmer?: SeedRequisitionFormOption;
  variety?: SeedRequisitionFormOption;
}) {
  const farmersQuery = useFarmers();
  const varietiesQuery = useVarieties();

  const options = useMemo<SeedRequisitionFormOptions>(() => {
    const farmers = (farmersQuery.data ?? []).map((farmer) => ({
      value: farmer.id,
      label: farmerOptionLabel(farmer.name, farmer.accountNumber),
    }));
    const varieties = (varietiesQuery.data ?? []).map((variety) => ({
      value: variety.id,
      label: variety.name,
    }));

    if (seed?.farmer && !farmers.some((option) => option.value === seed.farmer?.value)) {
      farmers.push(seed.farmer);
    }
    if (seed?.variety && !varieties.some((option) => option.value === seed.variety?.value)) {
      varieties.push(seed.variety);
    }

    return { farmers, varieties };
  }, [farmersQuery.data, varietiesQuery.data, seed?.farmer, seed?.variety]);

  return {
    options,
    isPending: farmersQuery.isPending || varietiesQuery.isPending,
    isError: farmersQuery.isError || varietiesQuery.isError,
    error: farmersQuery.error ?? varietiesQuery.error,
  };
}
