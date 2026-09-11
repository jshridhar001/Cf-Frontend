import { format } from 'date-fns';
import type { Farmer, FarmerContract } from '@/features/farmers/types';

export const COMPANY_NAME = 'Bhatti Agritech Pvt. Ltd.';
export const COMPANY_NAME_HI = 'भट्टी एग्रीटेक प्रा. लि.';
export const COMPANY_SHORT_NAME = 'Bhatti Agritech';
export const COMPANY_LOGO_URL =
  'https://res.cloudinary.com/dakh64xhy/image/upload/v1759410800/Bhatti-Agritech_gwqywg.jpg';
export const CONTRACT_TITLE = 'Potato Multiplication Agreement';
export const CONTRACT_TITLE_HI = 'पोटैटो मल्टीप्लीकेशन एग्रीमेंट';
export const COMPANY_ADDRESS =
  'Village - Alipur, PO - Mithapur, P.S – Sadar, Jalandhar, Tehsil & District- Jalandhar (Punjab)-144022';
export const COMPANY_ADDRESS_HI =
  'गांव अलीपुर, पोस्ट ऑफिस मीठापुर, पुलिस स्टेशन सदर, जालंधर, तहसील और जिला जालंधर (पंजाब) - 144022';
export const COMPANY_DELIVERY_ADDRESS = 'Bazpur, Udham Singh Nagar, Uttarakhand- 262401';
export const COMPANY_DELIVERY_ADDRESS_HI =
  'गांव अलीपुर, पोस्ट ऑफिस मीठापुर, जालंधर, तहसील और जिला जालंधर (पंजाब) - 144022';

const AGREEMENT_BLANK = '---';

export function displayOptional(value: string | number | null | undefined): string {
  if (value == null || value === '') return AGREEMENT_BLANK;
  return String(value);
}

export function formatContractGeneratedDate(date: Date = new Date()): string {
  return format(date, 'd MMM yyyy');
}

export function formatVarietyDisplay(variety: string): string {
  return variety.trim().toUpperCase();
}

function parseContractDate(date: string, fallback: Date): Date {
  const day = date.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return fallback;
  const parsed = new Date(`${day}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function acresLabel(acres: string | number): string {
  const n = typeof acres === 'number' ? acres : Number(acres);
  if (!Number.isFinite(n) || n <= 0) return AGREEMENT_BLANK;
  return String(n);
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
  const agreementDate = parseContractDate(contract.date, generatedAt);
  const village = displayOptional(farmer.locality?.name);

  return {
    companyName: COMPANY_NAME,
    companyAddress: COMPANY_ADDRESS,
    companyDeliveryAddress: COMPANY_DELIVERY_ADDRESS,
    contractTitle: CONTRACT_TITLE,
    variety: contract.variety,
    varietyDisplay: formatVarietyDisplay(contract.variety),
    agreementDay: format(agreementDate, 'd'),
    agreementMonth: format(agreementDate, 'MMMM'),
    agreementYear: format(agreementDate, 'yyyy'),
    farmerName: farmer.name,
    fatherName: AGREEMENT_BLANK,
    panNumber: displayOptional(farmer.panNumber),
    aadharNumber: displayOptional(farmer.aadharNumber),
    bankAccountNumber: displayOptional(farmer.bankAccountNumber),
    bankName: displayOptional(farmer.bankName),
    bankBranch: AGREEMENT_BLANK,
    ifsCode: displayOptional(farmer.ifscCode),
    village,
    policeStation: AGREEMENT_BLANK,
    postOffice: AGREEMENT_BLANK,
    tehsil: AGREEMENT_BLANK,
    district: displayOptional(farmer.station?.name),
    state: displayOptional(farmer.station?.state),
    pinCode: AGREEMENT_BLANK,
    landAcres: acresLabel(contract.acres),
    landVillage: village,
    mobileNumber: farmer.mobileNumber,
    accountNumber: farmer.accountNumber,
    totalBags: AGREEMENT_BLANK,
    generatedAtLabel: formatContractGeneratedDate(generatedAt),
  };
}
