import { z } from 'zod';

export const atualizarStatusOrcamentoSchema = z.object({
  status: z.enum(['ENVIADO', 'APROVADO', 'RECUSADO', 'EXPIRADO']),
});

export type AtualizarStatusOrcamentoDto = z.infer<typeof atualizarStatusOrcamentoSchema>;
