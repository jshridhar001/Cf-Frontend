import { format, isValid, parseISO } from 'date-fns';
import { type Farmer, type FarmerContract, formatContractAcres } from '@/features/farmers/types';

export const COMPANY_NAME = 'Bhatti Agritech Pvt. Ltd.';
export const COMPANY_SHORT_NAME = 'Bhatti Agritech';
export const CONTRACT_TITLE = 'Potato Multiplication Agreement';
export const COMPANY_ADDRESS =
  'Village - Alipur, PO - Mithapur, P.S – Sadar, Jalandhar, Tehsil & District- Jalandhar (Punjab)-144022';
export const COMPANY_DELIVERY_ADDRESS =
  'Village - Alipur, PO - Mithapur, Jalandhar, Tehsil & District- Jalandhar (Punjab)-144022';

export function displayOptional(value: string | number | null | undefined): string {
  if (value == null || value === '') return '—';
  return String(value);
}

export function formatContractGeneratedDate(date: Date = new Date()): string {
  return format(date, 'd MMM yyyy');
}

export function formatVarietyDisplay(variety: string): string {
  return variety.trim().toUpperCase();
}

function agreementDateParts(contractDate: string, fallback: Date) {
  const day = contractDate.slice(0, 10);
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(day) ? parseISO(day) : fallback;
  const date = isValid(parsed) ? parsed : fallback;
  return {
    agreementDay: format(date, 'd'),
    agreementMonth: format(date, 'MMMM'),
    agreementYear: format(date, 'yyyy'),
  };
}

export type AgreementContext = {
  companyName: string;
  companyAddress: string;
  companyDeliveryAddress: string;
  contractTitle: string;
  variety: string;
  varietyDisplay: string;
  agreementDay: string;
  agreementMonth: string;
  agreementYear: string;
  farmerName: string;
  fatherName: string;
  panNumber: string;
  aadharNumber: string;
  bankAccountNumber: string;
  bankName: string;
  bankBranch: string;
  ifsCode: string;
  village: string;
  policeStation: string;
  postOffice: string;
  tehsil: string;
  district: string;
  state: string;
  pinCode: string;
  landAcres: string;
  landVillage: string;
  mobileNumber: string;
  accountNumber: string;
  totalBags: string;
  generatedAtLabel: string;
};

export function buildAgreementContext(
  farmer: Farmer,
  contract: FarmerContract,
  generatedAt: Date = new Date(),
): AgreementContext {
  const acresLabel = formatContractAcres(contract.acres).trim();
  const { agreementDay, agreementMonth, agreementYear } = agreementDateParts(
    contract.date,
    generatedAt,
  );
  const locality = farmer.locality?.name;

  return {
    companyName: COMPANY_NAME,
    companyAddress: COMPANY_ADDRESS,
    companyDeliveryAddress: COMPANY_DELIVERY_ADDRESS,
    contractTitle: CONTRACT_TITLE,
    variety: contract.variety,
    varietyDisplay: formatVarietyDisplay(contract.variety),
    agreementDay,
    agreementMonth,
    agreementYear,
    farmerName: farmer.name,
    fatherName: '—',
    panNumber: displayOptional(farmer.panNumber),
    aadharNumber: displayOptional(farmer.aadharNumber),
    bankAccountNumber: displayOptional(farmer.bankAccountNumber),
    bankName: displayOptional(farmer.bankName),
    bankBranch: '—',
    ifsCode: displayOptional(farmer.ifscCode),
    village: displayOptional(locality),
    policeStation: '—',
    postOffice: '—',
    tehsil: '—',
    district: displayOptional(farmer.station?.name),
    state: '—',
    pinCode: '—',
    landAcres: acresLabel || '—',
    landVillage: displayOptional(locality),
    mobileNumber: farmer.mobileNumber,
    accountNumber: farmer.accountNumber,
    totalBags: '—',
    generatedAtLabel: formatContractGeneratedDate(generatedAt),
  };
}
