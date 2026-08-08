import { z } from 'zod';

const booleanQueryParam = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === 'true'));

export const listarContasPagarQuerySchema = z.object({
  status: z.enum(['ABERTO', 'PARCIAL', 'PAGO', 'CANCELADO']).optional(),
  fornecedorId: z.string().uuid().optional(),
  categoriaDespesaId: z.string().uuid().optional(),
  vencido: booleanQueryParam,
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListarContasPagarQueryDto = z.infer<typeof listarContasPagarQuerySchema>;
