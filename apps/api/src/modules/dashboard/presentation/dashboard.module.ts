import { Module } from '@nestjs/common';
import { DASHBOARD_REPOSITORY_FACTORY } from '../application/ports/dashboard-repository.factory';
import { ObterFluxoCaixaUseCase } from '../application/use-cases/obter-fluxo-caixa.use-case';
import { ObterProdutosMaisVendidosUseCase } from '../application/use-cases/obter-produtos-mais-vendidos.use-case';
import { ObterResumoFinanceiroUseCase } from '../application/use-cases/obter-resumo-financeiro.use-case';
import { PrismaDashboardRepository } from '../infra/prisma-dashboard.repository';
import { DashboardController } from './dashboard.controller';

@Module({
  controllers: [DashboardController],
  providers: [
    ObterResumoFinanceiroUseCase,
    ObterProdutosMaisVendidosUseCase,
    ObterFluxoCaixaUseCase,
    {
      provide: DASHBOARD_REPOSITORY_FACTORY,
      useValue: (
        tx: ConstructorParameters<typeof PrismaDashboardRepository>[0],
        empresaId: string,
      ) => new PrismaDashboardRepository(tx, empresaId),
    },
  ],
})
export class DashboardModule {}
