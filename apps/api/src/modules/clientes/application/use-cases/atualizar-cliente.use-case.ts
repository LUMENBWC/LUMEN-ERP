import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import {
  ClienteNaoEncontradoError,
  DocumentoInvalidoError,
  DocumentoJaCadastradoError,
} from '../../domain/cliente.errors';
import { validarDocumento } from '../../domain/validar-documento';
import type { AtualizarClienteDto } from '../dto/atualizar-cliente.dto';
import {
  CLIENTES_REPOSITORY_FACTORY,
  type ClientesRepositoryFactory,
} from '../ports/clientes-repository.factory';
import type { ClienteDetalhado } from '../ports/clientes.repository.port';

@Injectable()
export class AtualizarClienteUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CLIENTES_REPOSITORY_FACTORY) private readonly repoFactory: ClientesRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(
    tenant: TenantContext,
    id: string,
    dto: AtualizarClienteDto,
  ): Promise<ClienteDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const atual = await repo.obterPorId(id);
      if (!atual) {
        throw new ClienteNaoEncontradoError();
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

      const cliente = await repo.atualizar(
        id,
        {
          ...dto,
          limiteCredito:
            dto.limiteCredito === undefined ? undefined : new Prisma.Decimal(dto.limiteCredito),
        },
        tenant.usuarioId,
      );

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Cliente',
        entidadeId: cliente.id,
        acao: 'ATUALIZAR',
        dadosAntes: atual,
        dadosDepois: cliente,
      });

      return cliente;
    });
  }
}
