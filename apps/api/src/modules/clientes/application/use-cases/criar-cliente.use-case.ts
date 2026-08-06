import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { DocumentoInvalidoError, DocumentoJaCadastradoError } from '../../domain/cliente.errors';
import { validarDocumento } from '../../domain/validar-documento';
import type { CriarClienteDto } from '../dto/criar-cliente.dto';
import {
  CLIENTES_REPOSITORY_FACTORY,
  type ClientesRepositoryFactory,
} from '../ports/clientes-repository.factory';
import type { ClienteDetalhado } from '../ports/clientes.repository.port';

@Injectable()
export class CriarClienteUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CLIENTES_REPOSITORY_FACTORY) private readonly repoFactory: ClientesRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, dto: CriarClienteDto): Promise<ClienteDetalhado> {
    if (!validarDocumento(dto.tipoPessoa, dto.documento)) {
      throw new DocumentoInvalidoError();
    }

    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      if (await repo.existeDocumento(dto.documento)) {
        throw new DocumentoJaCadastradoError();
      }

      const cliente = await repo.criar(
        {
          tipoPessoa: dto.tipoPessoa,
          nome: dto.nome,
          documento: dto.documento,
          telefone: dto.telefone,
          whatsapp: dto.whatsapp,
          email: dto.email,
          logradouro: dto.logradouro,
          numero: dto.numero,
          complemento: dto.complemento,
          bairro: dto.bairro,
          cidade: dto.cidade,
          uf: dto.uf,
          cep: dto.cep,
          limiteCredito: new Prisma.Decimal(dto.limiteCredito),
          observacoes: dto.observacoes,
        },
        tenant.usuarioId,
      );

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Cliente',
        entidadeId: cliente.id,
        acao: 'CRIAR',
        dadosDepois: cliente,
      });

      return cliente;
    });
  }
}
