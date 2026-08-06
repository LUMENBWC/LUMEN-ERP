import { z } from 'zod';

export const criarFornecedorSchema = z.object({
  tipoPessoa: z.enum(['FISICA', 'JURIDICA']).default('JURIDICA'),
  nome: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.').max(255),
  documento: z.string().trim().min(1, 'Documento é obrigatório.').max(20),
  telefone: z.string().trim().max(20).nullable().optional().default(null),
  email: z.string().trim().email('E-mail inválido.').nullable().optional().default(null),
  logradouro: z.string().trim().max(255).nullable().optional().default(null),
  numero: z.string().trim().max(20).nullable().optional().default(null),
  complemento: z.string().trim().max(255).nullable().optional().default(null),
  bairro: z.string().trim().max(255).nullable().optional().default(null),
  cidade: z.string().trim().max(255).nullable().optional().default(null),
  uf: z.string().trim().length(2).nullable().optional().default(null),
  cep: z.string().trim().max(9).nullable().optional().default(null),
  observacoes: z.string().trim().max(2000).nullable().optional().default(null),
});

export type CriarFornecedorDto = z.infer<typeof criarFornecedorSchema>;
