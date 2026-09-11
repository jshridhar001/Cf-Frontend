export const FARMER_CONTRACT_PAGE_SIZES = [10, 50, 100] as const;
export const FARMER_CONTRACT_PAGE_SIZE = FARMER_CONTRACT_PAGE_SIZES[0];

export type FarmerContractPageSize = (typeof FARMER_CONTRACT_PAGE_SIZES)[number];

export function isFarmerContractPageSize(value: number): value is FarmerContractPageSize {
  return FARMER_CONTRACT_PAGE_SIZES.includes(value as FarmerContractPageSize);
}

export function getPaginationItems(
  current: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  if (start > 2) items.push('ellipsis');
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 1) items.push('ellipsis');
  items.push(totalPages);

  return items;
}
