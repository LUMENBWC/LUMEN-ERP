import { resolverPeriodo } from './resolver-periodo';

describe('resolverPeriodo', () => {
  const hoje = new Date('2026-06-30T12:00:00.000Z');

  it('usa hoje como fim e 30 dias atrás como início quando nada é informado', () => {
    const periodo = resolverPeriodo(undefined, undefined, hoje);

    expect(periodo.fim).toEqual(hoje);
    expect(periodo.inicio.toISOString()).toBe('2026-05-31T12:00:00.000Z');
  });

  it('usa as datas informadas quando ambas são fornecidas', () => {
    const inicio = new Date('2026-01-01T00:00:00.000Z');
    const fim = new Date('2026-01-31T00:00:00.000Z');

    const periodo = resolverPeriodo(inicio, fim, hoje);

    expect(periodo.inicio).toEqual(inicio);
    expect(periodo.fim).toEqual(fim);
  });

  it('usa hoje como fim quando só dataInicio é informada', () => {
    const inicio = new Date('2026-01-01T00:00:00.000Z');

    const periodo = resolverPeriodo(inicio, undefined, hoje);

    expect(periodo.inicio).toEqual(inicio);
    expect(periodo.fim).toEqual(hoje);
  });
});
