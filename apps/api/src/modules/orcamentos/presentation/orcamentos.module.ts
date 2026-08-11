import { Module } from '@nestjs/common';
import { ORCAMENTOS_REPOSITORY_FACTORY } from '../application/ports/orcamentos-repository.factory';
import { PDF_STORAGE_PORT } from '../application/ports/pdf-storage.port';
import { AtualizarOrcamentoUseCase } from '../application/use-cases/atualizar-orcamento.use-case';
import { AtualizarStatusOrcamentoUseCase } from '../application/use-cases/atualizar-status-orcamento.use-case';
import { CancelarOrcamentoUseCase } from '../application/use-cases/cancelar-orcamento.use-case';
import { CriarOrcamentoUseCase } from '../application/use-cases/criar-orcamento.use-case';
import { GerarPdfOrcamentoUseCase } from '../application/use-cases/gerar-pdf-orcamento.use-case';
import { ListarOrcamentosUseCase } from '../application/use-cases/listar-orcamentos.use-case';
import { ObterOrcamentoUseCase } from '../application/use-cases/obter-orcamento.use-case';
import { PrismaOrcamentosRepository } from '../infra/prisma-orcamentos.repository';
import { SupabasePdfStorage } from '../infra/supabase-pdf-storage';
import { OrcamentosController } from './orcamentos.controller';

@Module({
  controllers: [OrcamentosController],
  providers: [
    CriarOrcamentoUseCase,
    ListarOrcamentosUseCase,
    ObterOrcamentoUseCase,
    AtualizarOrcamentoUseCase,
    AtualizarStatusOrcamentoUseCase,
    CancelarOrcamentoUseCase,
    GerarPdfOrcamentoUseCase,
    {
      provide: ORCAMENTOS_REPOSITORY_FACTORY,
      useValue: (
        tx: ConstructorParameters<typeof PrismaOrcamentosRepository>[0],
        empresaId: string,
      ) => new PrismaOrcamentosRepository(tx, empresaId),
    },
    { provide: PDF_STORAGE_PORT, useClass: SupabasePdfStorage },
  ],
  exports: [ORCAMENTOS_REPOSITORY_FACTORY],
})
export class OrcamentosModule {}
