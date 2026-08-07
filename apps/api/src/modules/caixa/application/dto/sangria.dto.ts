import { z } from 'zod';

export const sangriaSchema = z.object({
  valor: z.number().positive('Valor deve ser maior que zero.'),
  motivo: z.string().trim().min(1, 'Motivo é obrigatório para registrar uma sangria.').max(500),
});

export type SangriaDto = z.infer<typeof sangriaSchema>;
