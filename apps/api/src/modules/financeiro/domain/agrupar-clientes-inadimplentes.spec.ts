import { Prisma } from '../../../../generated/prisma/client';
import {
  agruparClientesInadimplentes,
  type ContaVencidaParaAgrupar,
} from './agrupar-clientes-inadimplentes';

function conta(overrides: Partial<ContaVencidaParaAgrupar> = {}): ContaVencidaParaAgrupar {
  return {
    clienteId: 'cliente-1',
    clienteNome: 'João da Silva',
    valorTotal: new Prisma.Decimal(100),
    valorRecebido: new Prisma.Decimal(0),
    vencimento: new Date('2026-01-10T00:00:00.000Z'),
    ...overrides,
  };
}

describe('agruparClientesInadimplentes', () => {
  it('retorna vazio quando não há contas', () => {
    expect(agruparClientesInadimplentes([])).toEqual([]);
  });

  it('agrupa uma única conta em aberto', () => {
    const resultado = agruparClientesInadimplentes([conta()]);

    expect(resultado).toEqual([
      {
        clienteId: 'cliente-1',
        clienteNome: 'João da Silva',
        totalVencido: new Prisma.Decimal(100),
        quantidadeTitulos: 1,
        vencimentoMaisAntigo: new Date('2026-01-10T00:00:00.000Z'),
      },
    ]);
  });

  it('usa o saldo em aberto (valorTotal - valorRecebido), não o valorTotal puro', () => {
    const resultado = agruparClientesInadimplentes([
      conta({ valorTotal: new Prisma.Decimal(100), valorRecebido: new Prisma.Decimal(30) }),
    ]);

    expect(resultado[0].totalVencido).toEqual(new Prisma.Decimal(70));
  });

  it('soma múltiplos títulos do mesmo cliente e conta a quantidade', () => {
    const resultado = agruparClientesInadimplentes([
      conta({ valorTotal: new Prisma.Decimal(100), vencimento: new Date('2026-01-10') }),
      conta({ valorTotal: new Prisma.Decimal(50), vencimento: new Date('2026-01-05') }),
    ]);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].totalVencido).toEqual(new Prisma.Decimal(150));
    expect(resultado[0].quantidadeTitulos).toBe(2);
  });

  it('usa o vencimento mais antigo entre os títulos do cliente', () => {
    const resultado = agruparClientesInadimplentes([
      conta({ vencimento: new Date('2026-01-10') }),
      conta({ vencimento: new Date('2025-12-01') }),
      conta({ vencimento: new Date('2026-01-05') }),
    ]);

    expect(resultado[0].vencimentoMaisAntigo).toEqual(new Date('2025-12-01'));
  });

  it('ordena por total vencido decrescente entre clientes diferentes', () => {
    const resultado = agruparClientesInadimplentes([
      conta({
        clienteId: 'cliente-1',
        clienteNome: 'Devedor Pequeno',
        valorTotal: new Prisma.Decimal(50),
      }),
      conta({
        clienteId: 'cliente-2',
        clienteNome: 'Devedor Grande',
        valorTotal: new Prisma.Decimal(500),
      }),
      conta({
        clienteId: 'cliente-3',
        clienteNome: 'Devedor Médio',
        valorTotal: new Prisma.Decimal(200),
      }),
    ]);

    expect(resultado.map((r) => r.clienteId)).toEqual(['cliente-2', 'cliente-3', 'cliente-1']);
  });
});
