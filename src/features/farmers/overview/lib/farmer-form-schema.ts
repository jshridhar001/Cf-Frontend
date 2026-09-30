import * as z from 'zod';
import {
  type CreateFarmerBody,
  FARMER_ACCOUNT_TYPES,
  type Farmer,
  type FarmerAccountType,
  type FarmerFamily,
} from '@/features/farmers/overview/types';

const requiredId = (label: string) => z.string().min(1, `${label} is required.`);

export const farmerFormSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters.').max(64),
    accountNumber: z.string().min(1, 'Account number is required.').max(32),
    mobileNumber: z.string().min(8, 'Enter a valid mobile number.').max(20),
    aadharNumber: z.string().refine((value) => !value || /^\d{12}$/.test(value), {
      message: 'Aadhaar must be 12 digits.',
    }),
    panNumber: z.string().refine((value) => !value || /^[A-Z]{5}\d{4}[A-Z]$/.test(value), {
      message: 'PAN must be 10 characters (e.g. ABCDE1234F).',
    }),
    bankName: z.string().min(2, 'Bank name must be at least 2 characters.').max(64),
    bankAccountNumber: z
      .string()
      .regex(/^\d{8,18}$/, 'Enter a bank account number with 8 to 18 digits.'),
    ifscCode: z
      .string()
      .regex(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, 'Enter a valid 11-character IFSC code.'),
    stateId: requiredId('State'),
    districtId: requiredId('District'),
    stationId: requiredId('Station'),
    villageId: requiredId('Village'),
    postOfficeId: requiredId('Post office'),
    policeStationId: requiredId('Police station'),
    pincodeId: requiredId('Pincode'),
    accountType: z.enum(FARMER_ACCOUNT_TYPES),
    familyName: z.string().max(64),
    familyAccountNumber: z.string(),
    familyId: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.accountType === 'FAMILY_MEMBER' && !value.familyId.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['familyId'],
        message: 'Select a family.',
      });
    }
    if (value.accountType !== 'FAMILY_PRIMARY') return;
    if (!value.familyName.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['familyName'],
        message: 'Family name is required.',
      });
    }
    if (!/^[1-9]\d*$/.test(value.familyAccountNumber.trim())) {
      ctx.addIssue({
        code: 'custom',
        path: ['familyAccountNumber'],
        message: 'Enter a positive family account number.',
      });
    }
  });

export type FarmerFormValues = z.infer<typeof farmerFormSchema>;

export const FARMER_TYPE_OPTIONS: Array<{ value: FarmerAccountType; label: string }> = [
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'FAMILY_PRIMARY', label: 'Family primary account' },
  { value: 'FAMILY_MEMBER', label: 'Family member' },
];

const emptyTypeFields = {
  accountType: 'INDIVIDUAL' as const,
  familyName: '',
  familyAccountNumber: '',
  familyId: '',
};

export function createFarmerFormDefaults(): FarmerFormValues {
  return {
    name: '',
    accountNumber: '',
    mobileNumber: '',
    aadharNumber: '',
    panNumber: '',
    bankName: '',
    bankAccountNumber: '',
    ifscCode: '',
    stateId: '',
    districtId: '',
    stationId: '',
    villageId: '',
    postOfficeId: '',
    policeStationId: '',
    pincodeId: '',
    ...emptyTypeFields,
  };
}

function idOrEmpty(value?: string | null) {
  return value ?? '';
}

export function editFarmerFormDefaults(farmer: Farmer): FarmerFormValues {
  return {
    name: farmer.name,
    accountNumber: farmer.accountNumber,
    mobileNumber: farmer.mobileNumber,
    aadharNumber: farmer.aadharNumber ?? '',
    panNumber: (farmer.panNumber ?? '').toUpperCase(),
    bankName: farmer.bankName,
    bankAccountNumber: farmer.bankAccountNumber,
    ifscCode: farmer.ifscCode,
    stateId: idOrEmpty(farmer.stateId),
    districtId: idOrEmpty(farmer.districtId),
    stationId: idOrEmpty(farmer.stationId),
    villageId: idOrEmpty(farmer.villageId),
    postOfficeId: idOrEmpty(farmer.postOfficeId),
    policeStationId: idOrEmpty(farmer.policeStationId),
    pincodeId: idOrEmpty(farmer.pincodeId),
    accountType: farmer.accountType,
    familyId: farmer.familyId ?? '',
    familyName: farmer.family?.name ?? farmer.familyName ?? '',
    familyAccountNumber: farmer.family?.accountNumber ?? farmer.familyAccountNumber ?? '',
  };
}

export function fieldsClearedByAccountType(
  accountType: FarmerAccountType,
): Partial<Pick<FarmerFormValues, 'familyId' | 'familyName' | 'familyAccountNumber'>> {
  if (accountType === 'INDIVIDUAL') {
    return { familyId: '', familyName: '', familyAccountNumber: '' };
  }
  if (accountType === 'FAMILY_PRIMARY') {
    return { familyId: '' };
  }
  return { familyName: '', familyAccountNumber: '' };
}

export function familiesForStation(
  families: FarmerFamily[],
  stationId: string,
  savedFamily?: FarmerFamily | null,
): FarmerFamily[] {
  const withSaved =
    savedFamily?.id && !families.some((family) => family.id === savedFamily.id)
      ? [savedFamily, ...families]
      : families;

  if (!stationId) {
    return savedFamily?.id ? withSaved.filter((family) => family.id === savedFamily.id) : [];
  }

  return withSaved.filter((family) => {
    if (savedFamily?.id && family.id === savedFamily.id) return true;
    if (!family.stationId) return true;
    return family.stationId === stationId;
  });
}

export function toFarmerApiPayload(value: FarmerFormValues): CreateFarmerBody {
  return {
    name: value.name.trim(),
    accountNumber: value.accountNumber.trim(),
    mobileNumber: value.mobileNumber.trim(),
    accountType: value.accountType,
    stationId: value.stationId,
    villageId: value.villageId,
    postOfficeId: value.postOfficeId,
    policeStationId: value.policeStationId,
    districtId: value.districtId,
    stateId: value.stateId,
    pincodeId: value.pincodeId,
    bankName: value.bankName.trim(),
    bankAccountNumber: value.bankAccountNumber.trim(),
    ifscCode: value.ifscCode.trim().toUpperCase(),
    ...(value.aadharNumber.trim() ? { aadharNumber: value.aadharNumber.trim() } : {}),
    ...(value.panNumber.trim() ? { panNumber: value.panNumber.trim().toUpperCase() } : {}),
    ...(value.accountType === 'FAMILY_PRIMARY'
      ? {
          familyName: value.familyName.trim(),
          familyAccountNumber: value.familyAccountNumber.trim(),
        }
      : {}),
    ...(value.accountType === 'FAMILY_MEMBER' ? { familyId: value.familyId } : {}),
  };
}
