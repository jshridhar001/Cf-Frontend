export type DispatchFacilityOption = {
  id: string;
  name: string;
};

export type DispatchSizeOption = {
  id: string;
  name: string;
  bagsPerAcre: number | null;
};

export type DispatchGenerationOption = {
  id: string;
  name: string;
};

export type DispatchFormOptions = {
  facilities: DispatchFacilityOption[];
  sizes: DispatchSizeOption[];
  generations: DispatchGenerationOption[];
};

export function buildDispatchFormOptions(input: {
  facilities: Array<{ id: string; name: string; usedIn?: string }>;
  sizes: Array<{ id: string; name: string; seedBagsPerAcre?: number | null }>;
  generations: Array<{ id: string; name: string }>;
}): DispatchFormOptions {
  const dispatchFacilities = input.facilities.filter(
    (facility) => !facility.usedIn || facility.usedIn === 'SEED-DISPATCH',
  );

  return {
    facilities: (dispatchFacilities.length > 0 ? dispatchFacilities : input.facilities).map(
      (facility) => ({ id: facility.id, name: facility.name }),
    ),
    sizes: input.sizes.map((size) => ({
      id: size.id,
      name: size.name,
      bagsPerAcre: size.seedBagsPerAcre ?? null,
    })),
    generations: input.generations.map((generation) => ({
      id: generation.id,
      name: generation.name,
    })),
  };
}
