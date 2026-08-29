import type { Farmer } from '@/features/farmers/types';

export const FARMER_SORT_OPTIONS = [
  { value: 'account-asc', label: 'Account # (Low to High)' },
  { value: 'account-desc', label: 'Account # (High to Low)' },
  { value: 'name-asc', label: 'Name (A to Z)' },
  { value: 'name-desc', label: 'Name (Z to A)' },
] as const;

export type FarmerSortValue = (typeof FARMER_SORT_OPTIONS)[number]['value'];

export function isFarmerSortValue(value: string): value is FarmerSortValue {
  return FARMER_SORT_OPTIONS.some((option) => option.value === value);
}

function accountSortValue(accountNumber: string) {
  const match = accountNumber.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export function filterAndSortFarmers(
  farmers: Farmer[],
  search: string,
  sort: FarmerSortValue,
): Farmer[] {
  const query = search.trim().toLowerCase();
  const filtered = query
    ? farmers.filter((farmer) => farmer.name.toLowerCase().includes(query))
    : farmers;

  return [...filtered].sort((a, b) => {
    switch (sort) {
      case 'account-desc':
        return accountSortValue(b.accountNumber) - accountSortValue(a.accountNumber);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return accountSortValue(a.accountNumber) - accountSortValue(b.accountNumber);
    }
  });
}
