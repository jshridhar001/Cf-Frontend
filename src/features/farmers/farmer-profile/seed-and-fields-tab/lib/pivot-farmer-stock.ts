import { availableBags } from '@/features/transfer-stock/create/lib/stock-lines';
import type { FarmerStockRow } from '@/features/transfer-stock/create/types';

const PREFERRED_SIZE_ORDER = ['goli', 'keri', 'ration', 'seed', 'number-12'];

const bagFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export type StockSummarySize = {
  key: string;
  name: string;
};

export type StockSummaryRow = {
  varietyId: string;
  varietyName: string;
  bagsBySizeKey: Record<string, number>;
  total: number;
};

export type FarmerStockSummary = {
  sizes: StockSummarySize[];
  rows: StockSummaryRow[];
  columnTotals: Record<string, number>;
  grandTotal: number;
};

export function formatBagCount(value: number) {
  return bagFormatter.format(value);
}

function sizeKey(name: string) {
  return name.trim().toLowerCase();
}

function sizeRank(name: string) {
  const index = PREFERRED_SIZE_ORDER.indexOf(sizeKey(name));
  return index === -1 ? PREFERRED_SIZE_ORDER.length : index;
}

export function pivotFarmerStock(stock: FarmerStockRow[]): FarmerStockSummary {
  const sizeByKey = new Map<string, StockSummarySize>();
  const varietyById = new Map<string, StockSummaryRow>();

  for (const row of stock) {
    const key = sizeKey(row.size.name);
    if (!sizeByKey.has(key)) {
      sizeByKey.set(key, { key, name: row.size.name.trim() });
    }

    const bags = availableBags(row.balance);
    let variety = varietyById.get(row.varietyId);
    if (!variety) {
      variety = {
        varietyId: row.varietyId,
        varietyName: row.variety.name,
        bagsBySizeKey: {},
        total: 0,
      };
      varietyById.set(row.varietyId, variety);
    }

    variety.bagsBySizeKey[key] = (variety.bagsBySizeKey[key] ?? 0) + bags;
    variety.total += bags;
  }

  const sizes = [...sizeByKey.values()].sort((a, b) => {
    const rank = sizeRank(a.name) - sizeRank(b.name);
    if (rank !== 0) return rank;
    return a.name.localeCompare(b.name);
  });

  const rows = [...varietyById.values()].sort((a, b) => a.varietyName.localeCompare(b.varietyName));

  const columnTotals: Record<string, number> = {};
  for (const size of sizes) {
    columnTotals[size.key] = rows.reduce((sum, row) => sum + (row.bagsBySizeKey[size.key] ?? 0), 0);
  }

  return {
    sizes,
    rows,
    columnTotals,
    grandTotal: rows.reduce((sum, row) => sum + row.total, 0),
  };
}
