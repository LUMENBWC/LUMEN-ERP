import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { calcularSaldoAposDelta } from '../../domain/calcular-saldo-apos-delta';
import { ProdutoNaoEncontradoError } from '../../domain/estoque.errors';
import type { RegistrarPerdaDto } from '../dto/registrar-perda.dto';
import {
  ESTOQUE_REPOSITORY_FACTORY,
  type EstoqueRepositoryFactory,
} from '../ports/estoque-repository.factory';
import type { MovimentacaoResumo } from '../ports/estoque.repository.port';

@Injectable()
export class RegistrarPerdaUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(ESTOQUE_REPOSITORY_FACTORY) private readonly repoFactory: EstoqueRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, dto: RegistrarPerdaDto): Promise<MovimentacaoResumo> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const produto = await repo.obterProdutoComLock(dto.produtoId);
      if (!produto) {
        throw new ProdutoNaoEncontradoError();
      }

      // Perda é sempre uma saída - a quantidade no DTO é positiva (o quanto
      // se perdeu), o delta aplicado ao estoque é negativo.
      const delta = new Prisma.Decimal(dto.quantidade).negated();
      const permitirNegativo = tenant.permissoes.has('estoque.ajustarNegativo');
      const saldoApos = calcularSaldoAposDelta(produto.estoqueAtual, delta, permitirNegativo);

      const movimentacao = await repo.registrarDelta(
        {
          produtoId: dto.produtoId,
          tipo: 'PERDA',
          delta,
          saldoApos,
          motivo: dto.motivo,
        },
        tenant.usuarioId,
      );

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'MovimentacaoEstoque',
        entidadeId: movimentacao.id,
        acao: 'PERDA',
        dadosDepois: movimentacao,
      });

      return movimentacao;
    });
  }
}
