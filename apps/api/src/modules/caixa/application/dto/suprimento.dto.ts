import { z } from 'zod';

export const suprimentoSchema = z.object({
  valor: z.number().positive('Valor deve ser maior que zero.'),
  motivo: z.string().trim().max(500).nullable().optional().default(null),
});

export type SuprimentoDto = z.infer<typeof suprimentoSchema>;
