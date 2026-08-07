import { z } from 'zod';

export const listarSessoesQuerySchema = z.object({
  status: z.enum(['ABERTO', 'FECHADO']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListarSessoesQueryDto = z.infer<typeof listarSessoesQuerySchema>;
