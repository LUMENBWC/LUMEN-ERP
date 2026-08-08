import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { calcularStatusConta } from '../../domain/calcular-status-conta';
import {
  ContaJaQuitadaError,
  ContaPagarNaoEncontradaError,
  ValorLancamentoInvalidoError,
} from '../../domain/financeiro.errors';
import type { RegistrarPagamentoDto } from '../dto/registrar-pagamento.dto';
import {
  FINANCEIRO_REPOSITORY_FACTORY,
  type FinanceiroRepositoryFactory,
} from '../ports/financeiro-repository.factory';

@Injectable()
export class RegistrarPagamentoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(FINANCEIRO_REPOSITORY_FACTORY)
    private readonly repoFactory: FinanceiroRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(
    tenant: TenantContext,
    contaPagarId: string,
    dto: RegistrarPagamentoDto,
  ): Promise<void> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const conta = await repo.obterContaPagarComLock(contaPagarId);
      if (!conta) {
        throw new ContaPagarNaoEncontradaError();
      }
      if (conta.status === 'PAGO' || conta.status === 'CANCELADO') {
        throw new ContaJaQuitadaError();
      }

      const valor = new Prisma.Decimal(dto.valor);
      const saldoAberto = conta.valorTotal.minus(conta.valorAcumulado);
      if (valor.greaterThan(saldoAberto)) {
        throw new ValorLancamentoInvalidoError();
      }

      const novoValorPago = conta.valorAcumulado.plus(valor);
      const novoStatus = calcularStatusConta(conta.valorTotal, novoValorPago);

      await repo.registrarPagamento(
        { contaPagarId, valor, novoValorPago, novoStatus },
        tenant.usuarioId,
      );

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'ContaPagar',
        entidadeId: contaPagarId,
        acao: 'PAGAMENTO',
        dadosDepois: { valor: dto.valor, novoStatus },
      });
    });
  }
}
