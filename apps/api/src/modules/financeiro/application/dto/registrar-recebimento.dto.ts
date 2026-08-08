import { z } from 'zod';

export const registrarRecebimentoSchema = z.object({
  valor: z.number().positive('Valor deve ser maior que zero.'),
  formaPagamento: z.enum(['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'CREDITO_PARCELADO', 'A_PRAZO']),
});

export type RegistrarRecebimentoDto = z.infer<typeof registrarRecebimentoSchema>;
