import { z } from 'zod';

export const listarOrcamentosQuerySchema = z.object({
  clienteId: z.string().uuid().optional(),
  status: z
    .enum(['RASCUNHO', 'ENVIADO', 'APROVADO', 'RECUSADO', 'EXPIRADO', 'CONVERTIDO'])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['validade', 'total', 'createdAt']).default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

export type ListarOrcamentosQueryDto = z.infer<typeof listarOrcamentosQuerySchema>;
