export type LotReceiptProgress = {
  received: number;
  total: number;
};

export function getLotReceiptProgress(
  lots: Array<{ status: 'PENDING' | 'RECEIVED' }>,
): LotReceiptProgress {
  const total = lots.length;
  const received = lots.filter((lot) => lot.status === 'RECEIVED').length;
  return { received, total };
}

export function maskMobileNumber(mobile: string | null | undefined): string {
  const digits = (mobile ?? '').replace(/\D/g, '');
  if (digits.length < 4) {
    return '—';
  }
  return `${'*'.repeat(Math.max(digits.length - 4, 0))}${digits.slice(-4)}`;
}

export function canReceiveLot(input: {
  lotStatus: 'PENDING' | 'RECEIVED';
  dispatchStatus: 'DELIVERING' | 'DELIVERED' | 'NULL';
}): boolean {
  return input.lotStatus === 'PENDING' && input.dispatchStatus === 'DELIVERING';
}
