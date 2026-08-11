import { z } from 'zod';

const booleanQueryParam = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === 'true'));

export const listarContasReceberQuerySchema = z.object({
  status: z.enum(['ABERTO', 'PARCIAL', 'PAGO', 'CANCELADO']).optional(),
  clienteId: z.string().uuid().optional(),
  vencido: booleanQueryParam,
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['vencimento', 'valorTotal', 'createdAt']).default('vencimento'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
});

export type ListarContasReceberQueryDto = z.infer<typeof listarContasReceberQuerySchema>;
