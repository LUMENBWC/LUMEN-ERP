import { z } from 'zod';

export const listarMovimentacoesQuerySchema = z.object({
  produtoId: z.string().uuid().optional(),
  tipo: z.enum(['ENTRADA_COMPRA', 'SAIDA_VENDA', 'AJUSTE_MANUAL', 'PERDA']).optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListarMovimentacoesQueryDto = z.infer<typeof listarMovimentacoesQuerySchema>;
