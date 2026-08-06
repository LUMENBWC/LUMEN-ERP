import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { OrcamentoNaoEncontradoError } from '../../domain/orcamento.errors';
import { gerarPdfOrcamentoBuffer } from '../gerar-pdf-orcamento-buffer';
import { PDF_STORAGE_PORT, type PdfStoragePort } from '../ports/pdf-storage.port';
import {
  ORCAMENTOS_REPOSITORY_FACTORY,
  type OrcamentosRepositoryFactory,
} from '../ports/orcamentos-repository.factory';

const URL_EXPIRACAO_SEGUNDOS = 300;

@Injectable()
export class GerarPdfOrcamentoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(ORCAMENTOS_REPOSITORY_FACTORY)
    private readonly repoFactory: OrcamentosRepositoryFactory,
    @Inject(PDF_STORAGE_PORT) private readonly pdfStorage: PdfStoragePort,
  ) {}

  async execute(tenant: TenantContext, id: string): Promise<{ url: string }> {
    const dados = await this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      const resultado = await repo.obterDadosParaPdf(id);
      if (!resultado) {
        throw new OrcamentoNaoEncontradoError();
      }
      return resultado;
    });

    const buffer = await gerarPdfOrcamentoBuffer(dados);
    const caminho = `${tenant.empresaId}/${id}.pdf`;
    await this.pdfStorage.salvar(caminho, buffer);
    const url = await this.pdfStorage.obterUrlAssinada(caminho, URL_EXPIRACAO_SEGUNDOS);

    await this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      await repo.salvarPdfUrl(id, caminho);
    });

    return { url };
  }
}
