import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { validarDocumento } from '../../../clientes/domain/validar-documento';
import { DocumentoInvalidoError, DocumentoJaCadastradoError } from '../../domain/fornecedor.errors';
import type { CriarFornecedorDto } from '../dto/criar-fornecedor.dto';
import {
  FORNECEDORES_REPOSITORY_FACTORY,
  type FornecedoresRepositoryFactory,
} from '../ports/fornecedores-repository.factory';
import type { FornecedorDetalhado } from '../ports/fornecedores.repository.port';

@Injectable()
export class CriarFornecedorUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(FORNECEDORES_REPOSITORY_FACTORY)
    private readonly repoFactory: FornecedoresRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, dto: CriarFornecedorDto): Promise<FornecedorDetalhado> {
    if (!validarDocumento(dto.tipoPessoa, dto.documento)) {
      throw new DocumentoInvalidoError();
    }

    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      if (await repo.existeDocumento(dto.documento)) {
        throw new DocumentoJaCadastradoError();
      }

      const fornecedor = await repo.criar(
        {
          tipoPessoa: dto.tipoPessoa,
          nome: dto.nome,
          documento: dto.documento,
          telefone: dto.telefone,
          email: dto.email,
          logradouro: dto.logradouro,
          numero: dto.numero,
          complemento: dto.complemento,
          bairro: dto.bairro,
          cidade: dto.cidade,
          uf: dto.uf,
          cep: dto.cep,
          observacoes: dto.observacoes,
        },
        tenant.usuarioId,
      );

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Fornecedor',
        entidadeId: fornecedor.id,
        acao: 'CRIAR',
        dadosDepois: fornecedor,
      });

      return fornecedor;
    });
  }
}
