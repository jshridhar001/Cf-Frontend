export function formatFarmerLabel(farmer: { name: string; accountNumber?: string | null }) {
  return farmer.accountNumber ? `${farmer.name} (#${farmer.accountNumber})` : farmer.name;
}

const weightFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
});

export function formatWeight(value: string | number | null | undefined) {
  if (value == null || value === '') return '—';
  const amount = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(amount)) return String(value);
  return weightFormatter.format(amount);
}

export function displayOptional(value: string | number | null | undefined) {
  if (value == null || value === '') return '—';
  return String(value);
}
