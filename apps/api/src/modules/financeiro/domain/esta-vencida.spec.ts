import { estaVencida } from './esta-vencida';

describe('estaVencida', () => {
  const hoje = new Date('2026-06-15T12:00:00.000Z');

  it('retorna true para uma conta ABERTO com vencimento no passado', () => {
    expect(estaVencida(new Date('2026-06-10T00:00:00.000Z'), 'ABERTO', hoje)).toBe(true);
  });

  it('retorna true para uma conta PARCIAL com vencimento no passado', () => {
    expect(estaVencida(new Date('2026-06-10T00:00:00.000Z'), 'PARCIAL', hoje)).toBe(true);
  });

  it('retorna false para uma conta com vencimento no futuro', () => {
    expect(estaVencida(new Date('2026-06-20T00:00:00.000Z'), 'ABERTO', hoje)).toBe(false);
  });

  it('retorna false para uma conta já PAGA, mesmo com vencimento no passado', () => {
    expect(estaVencida(new Date('2026-06-10T00:00:00.000Z'), 'PAGO', hoje)).toBe(false);
  });
});
