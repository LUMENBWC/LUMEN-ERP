import { z } from 'zod';

export const registrarEntradaSchema = z.object({
  produtoId: z.string().uuid(),
  quantidade: z.number().positive('Quantidade deve ser maior que zero.'),
  custoUnitario: z.number().nonnegative('Custo unitário não pode ser negativo.'),
  fornecedorId: z.string().uuid().nullable().optional().default(null),
  motivo: z.string().trim().max(500).nullable().optional().default(null),
});

export type RegistrarEntradaDto = z.infer<typeof registrarEntradaSchema>;
