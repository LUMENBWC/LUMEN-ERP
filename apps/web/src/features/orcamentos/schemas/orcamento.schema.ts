import { z } from 'zod';

const itemOrcamentoSchema = z.object({
  produtoId: z.string().uuid('Selecione um produto.'),
  produtoNome: z.string().optional(),
  quantidade: z.coerce.number().positive('Quantidade deve ser maior que zero.'),
  precoUnitario: z.coerce.number().nonnegative('Preço unitário não pode ser negativo.'),
  desconto: z.coerce.number().nonnegative('Desconto não pode ser negativo.').default(0),
});

export const criarOrcamentoSchema = z.object({
  clienteId: z.string().uuid('Selecione um cliente.'),
  itens: z.array(itemOrcamentoSchema).min(1, 'Adicione ao menos um item.'),
  descontoGeral: z.coerce.number().nonnegative('Desconto geral não pode ser negativo.').default(0),
  validade: z
    .union([z.literal(''), z.string()])
    .nullable()
    .optional()
    .default(null)
    .transform((v) => (v ? v : null)),
  observacoes: z.string().trim().max(2000).nullable().optional().default(null),
});

export type CriarOrcamentoInput = z.infer<typeof criarOrcamentoSchema>;
export type ItemOrcamentoInput = z.infer<typeof itemOrcamentoSchema>;
