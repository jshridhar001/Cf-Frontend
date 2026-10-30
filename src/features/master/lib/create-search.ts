import { z } from 'zod';

const createSearchField = z
  .union([z.literal(true), z.literal(false), z.literal('true'), z.literal('false')])
  .optional()
  .transform((value) => value === true || value === 'true');

export const masterCreateSearchSchema = z.object({
  create: createSearchField,
});

export const masterFacilitiesSearchSchema = masterCreateSearchSchema.extend({
  tab: z.enum(['total', 'facility']).optional().default('total'),
});
