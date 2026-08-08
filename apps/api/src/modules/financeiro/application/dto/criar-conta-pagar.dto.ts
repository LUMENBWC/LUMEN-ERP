import { z } from 'zod';

export const criarContaPagarSchema = z.object({
  fornecedorId: z.string().uuid().nullable().optional().default(null),
  categoriaDespesaId: z.string().uuid().nullable().optional().default(null),
  descricao: z.string().trim().min(1, 'Descrição é obrigatória.').max(255),
  valorTotal: z.number().positive('Valor deve ser maior que zero.'),
  vencimento: z.coerce.date(),
});

export type CriarContaPagarDto = z.infer<typeof criarContaPagarSchema>;
