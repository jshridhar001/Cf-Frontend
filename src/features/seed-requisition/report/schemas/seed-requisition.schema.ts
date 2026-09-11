import { z } from 'zod';

export const createSeedRequisitionFormSchema = z
  .object({
    farmerId: z.string().min(1, 'Farmer is required.'),
    varietyId: z.string().min(1, 'Variety is required.'),
    quantityMode: z.enum(['acres', 'bags']),
    acres: z.number(),
    seedBags: z.number(),
    requisitionDate: z.string().min(1, 'Requisition date is required.'),
    requestedDeliveryDate: z.string().min(1, 'Requested delivery date is required.'),
    remarks: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.quantityMode === 'acres') {
      if (!(value.acres > 0)) {
        ctx.addIssue({
          code: 'custom',
          path: ['acres'],
          message: 'Acres must be greater than 0.',
        });
      }
      return;
    }

    if (!Number.isInteger(value.seedBags) || value.seedBags < 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['seedBags'],
        message: 'Seed bags must be at least 1.',
      });
    }
  });

export type CreateSeedRequisitionFormValues = z.infer<typeof createSeedRequisitionFormSchema>;

export const emptyCreateSeedRequisitionFormValues: CreateSeedRequisitionFormValues = {
  farmerId: '',
  varietyId: '',
  quantityMode: 'acres',
  acres: 0,
  seedBags: 0,
  requisitionDate: '',
  requestedDeliveryDate: '',
  remarks: '',
};

export const approveSeedRequisitionFormSchema = z.object({
  approvedDeliveryDate: z.string().min(1, 'Approved delivery date is required.'),
});

export type ApproveSeedRequisitionFormValues = z.infer<typeof approveSeedRequisitionFormSchema>;

export const rejectSeedRequisitionFormSchema = z.object({
  rejectionRemarks: z.string().trim().min(1, 'Rejection remarks are required.'),
});

export type RejectSeedRequisitionFormValues = z.infer<typeof rejectSeedRequisitionFormSchema>;
