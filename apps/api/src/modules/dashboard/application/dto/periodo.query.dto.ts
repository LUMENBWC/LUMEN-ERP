import { z } from 'zod';

export const periodoQuerySchema = z.object({
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
});

export type PeriodoQueryDto = z.infer<typeof periodoQuerySchema>;
