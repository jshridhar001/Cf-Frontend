import { z } from 'zod';

export const masterCreateSearchSchema = z.object({
  create: z
    .union([z.literal(true), z.literal(false), z.literal('true'), z.literal('false')])
    .optional()
    .transform((value) => value === true || value === 'true'),
});
