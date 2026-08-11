import { z } from 'zod';

export const listarClientesInadimplentesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListarClientesInadimplentesQueryDto = z.infer<
  typeof listarClientesInadimplentesQuerySchema
>;
