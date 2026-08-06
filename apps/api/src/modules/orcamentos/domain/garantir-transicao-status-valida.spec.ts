import { garantirTransicaoStatusValida } from './garantir-transicao-status-valida';
import { TransicaoStatusInvalidaError } from './orcamento.errors';

describe('garantirTransicaoStatusValida', () => {
  it.each([
    ['RASCUNHO', 'ENVIADO'],
    ['ENVIADO', 'APROVADO'],
    ['ENVIADO', 'RECUSADO'],
    ['ENVIADO', 'EXPIRADO'],
    ['APROVADO', 'EXPIRADO'],
  ] as const)('permite %s -> %s', (atual, novo) => {
    expect(() => garantirTransicaoStatusValida(atual, novo)).not.toThrow();
  });

  it.each([
    ['RASCUNHO', 'APROVADO'],
    ['RASCUNHO', 'CONVERTIDO'],
    ['ENVIADO', 'CONVERTIDO'],
    ['APROVADO', 'CONVERTIDO'],
    ['APROVADO', 'RASCUNHO'],
    ['RECUSADO', 'ENVIADO'],
    ['EXPIRADO', 'ENVIADO'],
    ['CONVERTIDO', 'RASCUNHO'],
  ] as const)('rejeita %s -> %s', (atual, novo) => {
    expect(() => garantirTransicaoStatusValida(atual, novo)).toThrow(TransicaoStatusInvalidaError);
  });
});
