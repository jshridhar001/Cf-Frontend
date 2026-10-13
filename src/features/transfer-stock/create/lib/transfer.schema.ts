import { z } from 'zod';

const optionalDecimal = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine(
    (value) => !value || /^\d+(\.\d{1,2})?$/.test(value),
    'Enter a valid number with up to 2 decimal places',
  );

const optionalString = z.string().trim().optional().or(z.literal(''));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Enter a valid date');

export const transferLineSchema = z.object({
  varietyId: z.string().min(1, 'Variety is required'),
  sizeId: z.string().min(1, 'Seed size is required'),
  generationId: z.string().min(1, 'Generation is required'),
  bagQuantity: z.number().int().positive('Bag quantity must be greater than 0'),
});

export const transferDetailsSchema = z.object({
  transferDate: optionalDate,
  toLocation: z.string().trim().min(1, 'Destination is required'),
  truckNumber: z.string().trim().min(1, 'Truck number is required'),
  manualGatePassNumber: optionalString,
  weightSlipNumber: optionalString,
  driverMobile: optionalString,
  grossWeight: optionalDecimal,
  tareWeight: optionalDecimal,
  remarks: optionalString,
});

export const createTransferSchema = transferDetailsSchema
  .extend({
    fromFarmerId: z.string().min(1, 'Select a source farmer'),
    toFarmerId: z.string().min(1, 'Select a destination farmer'),
    lines: z.array(transferLineSchema).min(1, 'Add at least one stock line'),
  })
  .superRefine((data, ctx) => {
    if (data.fromFarmerId && data.toFarmerId && data.fromFarmerId === data.toFarmerId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Source and destination farmers must be different',
        path: ['toFarmerId'],
      });
    }

    const keys = new Set<string>();
    data.lines.forEach((line, index) => {
      const key = `${line.varietyId}:${line.sizeId}:${line.generationId}`;
      if (keys.has(key)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Duplicate variety, size, and generation on this transfer',
          path: ['lines', index],
        });
      }
      keys.add(key);
    });
  });

export type TransferLineInput = z.infer<typeof transferLineSchema>;
export type TransferDetailsInput = z.infer<typeof transferDetailsSchema>;
export type CreateTransferInput = z.infer<typeof createTransferSchema>;

export function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

export const emptyTransferDetailsValues: TransferDetailsInput = {
  transferDate: todayDateOnly(),
  toLocation: '',
  truckNumber: '',
  manualGatePassNumber: '',
  weightSlipNumber: '',
  driverMobile: '',
  grossWeight: '',
  tareWeight: '',
  remarks: '',
};
