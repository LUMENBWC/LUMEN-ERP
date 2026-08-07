import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { calcularValorEsperado } from '../../domain/calcular-valor-esperado';
import { CaixaNaoAbertoError } from '../../domain/caixa.errors';
import type { FecharCaixaDto } from '../dto/fechar-caixa.dto';
import {
  CAIXA_REPOSITORY_FACTORY,
  type CaixaRepositoryFactory,
} from '../ports/caixa-repository.factory';
import type { CaixaSessaoResumo } from '../ports/caixa.repository.port';

@Injectable()
export class FecharCaixaUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CAIXA_REPOSITORY_FACTORY) private readonly repoFactory: CaixaRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, dto: FecharCaixaDto): Promise<CaixaSessaoResumo> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const sessao = await repo.sessaoAbertaDaEmpresa();
      if (!sessao) {
        throw new CaixaNaoAbertoError();
      }

      const movimentos = await repo.listarMovimentos(sessao.id);
      const valorFechamentoEsperado = calcularValorEsperado(movimentos);
      const valorFechamentoInformado = new Prisma.Decimal(dto.valorFechamentoInformado);
      const diferenca = valorFechamentoInformado.minus(valorFechamentoEsperado);

      const sessaoFechada = await repo.fechar({
        caixaSessaoId: sessao.id,
        valorFechamentoInformado,
        valorFechamentoEsperado,
        diferenca,
      });

      await repo.registrarMovimento(
        {
          caixaSessaoId: sessao.id,
          tipo: 'FECHAMENTO',
          valor: valorFechamentoInformado,
          descricao: dto.observacoes,
        },
        tenant.usuarioId,
      );

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'CaixaSessao',
        entidadeId: sessao.id,
        acao: 'FECHAR',
        dadosDepois: {
          valorFechamentoInformado: dto.valorFechamentoInformado,
          valorFechamentoEsperado: valorFechamentoEsperado.toNumber(),
          diferenca: diferenca.toNumber(),
        },
      });

      return sessaoFechada;
    });
  }
}
