import { z } from 'zod';

export const atualizarClienteSchema = z
  .object({
    tipoPessoa: z.enum(['FISICA', 'JURIDICA']).optional(),
    nome: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.').max(255).optional(),
    documento: z.string().trim().min(1, 'Documento é obrigatório.').max(20).optional(),
    telefone: z.string().trim().max(20).nullable().optional(),
    whatsapp: z.string().trim().max(20).nullable().optional(),
    email: z.string().trim().email('E-mail inválido.').nullable().optional(),
    logradouro: z.string().trim().max(255).nullable().optional(),
    numero: z.string().trim().max(20).nullable().optional(),
    complemento: z.string().trim().max(255).nullable().optional(),
    bairro: z.string().trim().max(255).nullable().optional(),
    cidade: z.string().trim().max(255).nullable().optional(),
    uf: z.string().trim().length(2).nullable().optional(),
    cep: z.string().trim().max(9).nullable().optional(),
    inscricaoEstadual: z.string().trim().max(20).nullable().optional(),
    limiteCredito: z.number().nonnegative('Limite de crédito não pode ser negativo.').optional(),
    observacoes: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type AtualizarClienteDto = z.infer<typeof atualizarClienteSchema>;

export const definirAtivoClienteSchema = z.object({ ativo: z.boolean() });
export type DefinirAtivoClienteDto = z.infer<typeof definirAtivoClienteSchema>;
