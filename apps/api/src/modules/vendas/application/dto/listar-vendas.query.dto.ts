import { z } from 'zod';

export const listarVendasQuerySchema = z.object({
  clienteId: z.string().uuid().optional(),
  status: z.enum(['CONCLUIDA', 'CANCELADA']).optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListarVendasQueryDto = z.infer<typeof listarVendasQuerySchema>;
