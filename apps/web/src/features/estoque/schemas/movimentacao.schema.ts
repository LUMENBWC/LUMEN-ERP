import { z } from 'zod';

export const registrarEntradaSchema = z.object({
  produtoId: z.string().uuid('Selecione um produto.'),
  quantidade: z.coerce.number().positive('Quantidade deve ser maior que zero.'),
  custoUnitario: z.coerce.number().nonnegative('Custo unitário não pode ser negativo.'),
  fornecedorId: z.string().uuid().nullable().optional().default(null),
  motivo: z.string().trim().max(500).nullable().optional().default(null),
});
export type RegistrarEntradaInput = z.infer<typeof registrarEntradaSchema>;

export const registrarAjusteSchema = z.object({
  produtoId: z.string().uuid('Selecione um produto.'),
  quantidade: z.coerce.number().refine((v) => v !== 0, 'Quantidade não pode ser zero.'),
  motivo: z.string().trim().min(1, 'Motivo é obrigatório para ajuste manual.').max(500),
});
export type RegistrarAjusteInput = z.infer<typeof registrarAjusteSchema>;

export const registrarPerdaSchema = z.object({
  produtoId: z.string().uuid('Selecione um produto.'),
  quantidade: z.coerce.number().positive('Quantidade deve ser maior que zero.'),
  motivo: z.string().trim().min(1, 'Motivo é obrigatório para registrar uma perda.').max(500),
});
export type RegistrarPerdaInput = z.infer<typeof registrarPerdaSchema>;
