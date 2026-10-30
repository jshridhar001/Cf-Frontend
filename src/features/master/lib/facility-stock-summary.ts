import type { FacilityStockSummaryVariety } from '@/features/master/types';

export type StockQuantity = {
  initialQuantity: number;
  currentQuantity: number;
};

export type StockMatrixColumn = {
  id: string;
  name: string;
};

export type StockMatrixCell = {
  all: StockQuantity;
  byGeneration: Record<string, StockQuantity>;
};

export type StockMatrixRow = {
  id: string;
  name: string;
  cells: Record<string, StockMatrixCell>;
};

export type StockMatrix = {
  sizes: StockMatrixColumn[];
  generations: StockMatrixColumn[];
  rows: StockMatrixRow[];
};

const emptyQuantity = (): StockQuantity => ({
  initialQuantity: 0,
  currentQuantity: 0,
});

export function quantityForView(
  cell: StockMatrixCell | undefined,
  generationId: 'all' | string,
): StockQuantity {
  if (!cell) return emptyQuantity();
  if (generationId === 'all') return cell.all;
  return cell.byGeneration[generationId] ?? emptyQuantity();
}

export function sumQuantities(quantities: StockQuantity[]): StockQuantity {
  return quantities.reduce<StockQuantity>(
    (sum, quantity) => ({
      initialQuantity: sum.initialQuantity + quantity.initialQuantity,
      currentQuantity: sum.currentQuantity + quantity.currentQuantity,
    }),
    emptyQuantity(),
  );
}

export function buildFacilityStockMatrix(varieties: FacilityStockSummaryVariety[]): StockMatrix {
  const sizes: StockMatrixColumn[] = [];
  const generations: StockMatrixColumn[] = [];
  const seenSizes = new Set<string>();
  const seenGenerations = new Set<string>();

  for (const variety of varieties) {
    for (const size of variety.sizes) {
      if (!seenSizes.has(size.size.id)) {
        seenSizes.add(size.size.id);
        sizes.push({ id: size.size.id, name: size.size.name });
      }

      for (const generation of size.generations) {
        if (!seenGenerations.has(generation.generation.id)) {
          seenGenerations.add(generation.generation.id);
          generations.push({ id: generation.generation.id, name: generation.generation.name });
        }
      }
    }
  }

  const rows: StockMatrixRow[] = varieties.map((variety) => {
    const cells: Record<string, StockMatrixCell> = {};

    for (const size of sizes) {
      cells[size.id] = { all: emptyQuantity(), byGeneration: {} };
    }

    for (const size of variety.sizes) {
      const byGeneration: Record<string, StockQuantity> = {};
      for (const generation of size.generations) {
        byGeneration[generation.generation.id] = {
          initialQuantity: generation.initialQuantity,
          currentQuantity: generation.currentQuantity,
        };
      }

      cells[size.size.id] = {
        all: {
          initialQuantity: size.initialQuantity,
          currentQuantity: size.currentQuantity,
        },
        byGeneration,
      };
    }

    return {
      id: variety.variety.id,
      name: variety.variety.name,
      cells,
    };
  });

  return { sizes, generations, rows };
}
