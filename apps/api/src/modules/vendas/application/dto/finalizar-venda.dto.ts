import { z } from 'zod';

const itemVendaSchema = z.object({
  produtoId: z.string().uuid(),
  quantidade: z.number().positive('Quantidade deve ser maior que zero.'),
  precoUnitario: z.number().nonnegative('Preço unitário não pode ser negativo.'),
  desconto: z.number().nonnegative('Desconto não pode ser negativo.').default(0),
});

const pagamentoVendaSchema = z.object({
  formaPagamento: z.enum(['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'CREDITO_PARCELADO', 'A_PRAZO']),
  valor: z.number().positive('Valor do pagamento deve ser maior que zero.'),
  parcelas: z.number().int().min(1).max(24).default(1),
  bandeira: z.string().trim().max(50).nullable().optional().default(null),
});

export const finalizarVendaSchema = z
  .object({
    // Quando informado, a venda é gerada a partir de um orçamento aprovado
    // (clienteId/itens/descontoGeral vêm do orçamento, não do corpo da
    // requisição - "reaproveitando os itens", spec Seção 3.5).
    orcamentoId: z.string().uuid().nullable().optional().default(null),
    clienteId: z.string().uuid().nullable().optional().default(null),
    itens: z.array(itemVendaSchema).optional().default([]),
    descontoGeral: z.number().nonnegative('Desconto geral não pode ser negativo.').default(0),
    pagamentos: z.array(pagamentoVendaSchema).min(1, 'Informe ao menos uma forma de pagamento.'),
  })
  .refine((data) => data.orcamentoId !== null || data.itens.length > 0, {
    message: 'A venda precisa de ao menos um item.',
    path: ['itens'],
  });

export type FinalizarVendaDto = z.infer<typeof finalizarVendaSchema>;
