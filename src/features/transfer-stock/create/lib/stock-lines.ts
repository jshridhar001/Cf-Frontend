import type { FarmerStockRow } from '@/features/transfer-stock/create/types';

export type BagDrafts = Record<string, string>;

export type SelectedTransferLine = {
  stockId: string;
  varietyId: string;
  sizeId: string;
  generationId: string;
  bagQuantity: number;
  varietyName: string;
  sizeName: string;
  generationName: string;
};

export function availableBags(balance: string): number {
  const value = Number(balance);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}

export function parseBagQuantity(raw: string | undefined): number | null {
  const value = raw?.trim() ?? '';
  if (!value || !/^\d+$/.test(value)) return null;
  const quantity = Number.parseInt(value, 10);
  return quantity > 0 ? quantity : null;
}

export function draftExceedsBalance(raw: string | undefined, max: number): boolean {
  const quantity = parseBagQuantity(raw);
  return quantity != null && quantity > max;
}

export function selectedTransferLines(
  stock: FarmerStockRow[],
  drafts: BagDrafts,
): SelectedTransferLine[] {
  return stock.flatMap((row) => {
    const max = availableBags(row.balance);
    const quantity = parseBagQuantity(drafts[row.id]);
    if (quantity == null || quantity > max) return [];
    return [
      {
        stockId: row.id,
        varietyId: row.varietyId,
        sizeId: row.sizeId,
        generationId: row.generationId,
        bagQuantity: quantity,
        varietyName: row.variety.name,
        sizeName: row.size.name,
        generationName: row.generation.name,
      },
    ];
  });
}

export function totalSelectedBags(lines: Array<{ bagQuantity: number }>) {
  return lines.reduce((sum, line) => sum + line.bagQuantity, 0);
}

export function sortStockRows(stock: FarmerStockRow[]) {
  return [...stock].sort((a, b) => {
    const variety = a.variety.name.localeCompare(b.variety.name);
    if (variety !== 0) return variety;
    const size = a.size.name.localeCompare(b.size.name);
    if (size !== 0) return size;
    return a.generation.name.localeCompare(b.generation.name);
  });
}
