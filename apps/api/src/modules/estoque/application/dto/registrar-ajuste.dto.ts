import { z } from 'zod';

export const registrarAjusteSchema = z.object({
  produtoId: z.string().uuid(),
  quantidade: z
    .number()
    .refine((v) => v !== 0, 'Quantidade não pode ser zero.')
    .describe('Positiva aumenta o estoque, negativa reduz.'),
  motivo: z.string().trim().min(1, 'Motivo é obrigatório para ajuste manual.').max(500),
});

export type RegistrarAjusteDto = z.infer<typeof registrarAjusteSchema>;
