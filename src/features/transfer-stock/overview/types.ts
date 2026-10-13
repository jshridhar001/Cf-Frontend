export const STOCK_TRANSFER_STATUSES = ['PENDING', 'RECEIVED', 'NULL'] as const;

export type StockTransferStatus = (typeof STOCK_TRANSFER_STATUSES)[number];

export type StockTransferFarmer = {
  id: string;
  name: string;
  accountNumber?: string | null;
  mobileNumber?: string | null;
};

export type StockTransferVariety = {
  id: string;
  name: string;
};

export type StockTransferSize = {
  id: string;
  name: string;
  seedBagsPerAcre?: number;
};

export type StockTransferGeneration = {
  id: string;
  name: string;
};

export type StockTransferLine = {
  id: string;
  stockTransferId: string;
  varietyId: string;
  sizeId: string;
  generationId: string;
  bagQuantity: number;
  variety: StockTransferVariety;
  size: StockTransferSize;
  generation: StockTransferGeneration;
};

export type StockTransfer = {
  id: string;
  fromFarmerId: string;
  toFarmerId: string;
  toLocation: string;
  status: StockTransferStatus | string;
  transferDate?: string | null;
  truckNumber: string;
  driverMobile?: string | null;
  manualGatePassNumber?: string | null;
  weightSlipNumber?: string | null;
  grossWeight?: string | null;
  tareWeight?: string | null;
  netWeight?: string | null;
  remarks?: string | null;
  createdById?: string | null;
  receivedAt?: string | null;
  receivedById?: string | null;
  createdAt: string;
  updatedAt: string;
  fromFarmer: StockTransferFarmer;
  toFarmer: StockTransferFarmer;
  lines: StockTransferLine[];
};

export type StockTransfersResponse = {
  success: boolean;
  data: StockTransfer[];
};

export type StockTransferResponse = {
  success: boolean;
  data: StockTransfer;
};

export function isStockTransferStatus(value: string): value is StockTransferStatus {
  return (STOCK_TRANSFER_STATUSES as readonly string[]).includes(value);
}

export function formatStockTransferStatus(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'RECEIVED':
      return 'Received';
    case 'NULL':
      return 'Null';
    default:
      return status;
  }
}

export function formatTransferDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function totalTransferBags(transfer: { lines: Array<{ bagQuantity: number }> }) {
  return transfer.lines.reduce((sum, line) => sum + line.bagQuantity, 0);
}
