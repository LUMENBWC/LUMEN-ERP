import { Prisma } from '../../../../generated/prisma/client';

export interface ContaVencidaParaAgrupar {
  clienteId: string;
  clienteNome: string;
  valorTotal: Prisma.Decimal;
  valorRecebido: Prisma.Decimal;
  vencimento: Date;
}

export interface ClienteInadimplenteResumo {
  clienteId: string;
  clienteNome: string;
  totalVencido: Prisma.Decimal;
  quantidadeTitulos: number;
  vencimentoMaisAntigo: Date;
}

/**
 * Agrupa contas a receber já filtradas como vencidas (`ABERTO`/`PARCIAL`,
 * `vencimento < hoje`) por cliente, somando o saldo em aberto de cada título
 * (`valorTotal - valorRecebido`, nunca `valorTotal` puro - uma conta parcial
 * já teve parte quitada). Ordenado por total vencido decrescente - quem deve
 * mais aparece primeiro.
 */
export function agruparClientesInadimplentes(
  contas: ContaVencidaParaAgrupar[],
): ClienteInadimplenteResumo[] {
  const porCliente = new Map<string, ClienteInadimplenteResumo>();

  for (const conta of contas) {
    const saldo = conta.valorTotal.minus(conta.valorRecebido);
    const atual = porCliente.get(conta.clienteId);

    if (!atual) {
      porCliente.set(conta.clienteId, {
        clienteId: conta.clienteId,
        clienteNome: conta.clienteNome,
        totalVencido: saldo,
        quantidadeTitulos: 1,
        vencimentoMaisAntigo: conta.vencimento,
      });
      continue;
    }

    atual.totalVencido = atual.totalVencido.plus(saldo);
    atual.quantidadeTitulos += 1;
    if (conta.vencimento < atual.vencimentoMaisAntigo) {
      atual.vencimentoMaisAntigo = conta.vencimento;
    }
  }

  return Array.from(porCliente.values()).sort((a, b) => b.totalVencido.comparedTo(a.totalVencido));
}
