import { z } from 'zod';

const itemOrcamentoSchema = z.object({
  produtoId: z.string().uuid(),
  quantidade: z.number().positive('Quantidade deve ser maior que zero.'),
  precoUnitario: z.number().nonnegative('Preço unitário não pode ser negativo.'),
  desconto: z.number().nonnegative('Desconto não pode ser negativo.').default(0),
});

export const criarOrcamentoSchema = z.object({
  clienteId: z.string().uuid(),
  itens: z.array(itemOrcamentoSchema).min(1, 'Orçamento precisa de ao menos um item.'),
  descontoGeral: z.number().nonnegative('Desconto geral não pode ser negativo.').default(0),
  validade: z.coerce.date().nullable().optional().default(null),
  observacoes: z.string().trim().max(2000).nullable().optional().default(null),
});

export type CriarOrcamentoDto = z.infer<typeof criarOrcamentoSchema>;
export type ItemOrcamentoDto = z.infer<typeof itemOrcamentoSchema>;
