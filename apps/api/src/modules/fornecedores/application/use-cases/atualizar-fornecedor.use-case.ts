import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { validarDocumento } from '../../../clientes/domain/validar-documento';
import {
  DocumentoInvalidoError,
  DocumentoJaCadastradoError,
  FornecedorNaoEncontradoError,
} from '../../domain/fornecedor.errors';
import type { AtualizarFornecedorDto } from '../dto/atualizar-fornecedor.dto';
import {
  FORNECEDORES_REPOSITORY_FACTORY,
  type FornecedoresRepositoryFactory,
} from '../ports/fornecedores-repository.factory';
import type { FornecedorDetalhado } from '../ports/fornecedores.repository.port';

@Injectable()
export class AtualizarFornecedorUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(FORNECEDORES_REPOSITORY_FACTORY)
    private readonly repoFactory: FornecedoresRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(
    tenant: TenantContext,
    id: string,
    dto: AtualizarFornecedorDto,
  ): Promise<FornecedorDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const atual = await repo.obterPorId(id);
      if (!atual) {
        throw new FornecedorNaoEncontradoError();
      }

      if (dto.documento !== undefined || dto.tipoPessoa !== undefined) {
        const tipoPessoa = dto.tipoPessoa ?? atual.tipoPessoa;
        const documento = dto.documento ?? atual.documento;
        if (!validarDocumento(tipoPessoa, documento)) {
          throw new DocumentoInvalidoError();
        }
        if (await repo.existeDocumento(documento, id)) {
          throw new DocumentoJaCadastradoError();
        }
      }

      const fornecedor = await repo.atualizar(id, dto, tenant.usuarioId);

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Fornecedor',
        entidadeId: fornecedor.id,
        acao: 'ATUALIZAR',
        dadosAntes: atual,
        dadosDepois: fornecedor,
      });

      return fornecedor;
    });
  }
}
