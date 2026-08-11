import { Module } from '@nestjs/common';
import { CaixaModule } from '../../caixa/presentation/caixa.module';
import { EstoqueModule } from '../../estoque/presentation/estoque.module';
import { OrcamentosModule } from '../../orcamentos/presentation/orcamentos.module';
import { VENDAS_REPOSITORY_FACTORY } from '../application/ports/vendas-repository.factory';
import { CancelarVendaUseCase } from '../application/use-cases/cancelar-venda.use-case';
import { FinalizarVendaUseCase } from '../application/use-cases/finalizar-venda.use-case';
import { ListarVendasUseCase } from '../application/use-cases/listar-vendas.use-case';
import { ObterVendaUseCase } from '../application/use-cases/obter-venda.use-case';
import { PrismaVendasRepository } from '../infra/prisma-vendas.repository';
import { VendasController } from './vendas.controller';

@Module({
  imports: [EstoqueModule, CaixaModule, OrcamentosModule],
  controllers: [VendasController],
  providers: [
    FinalizarVendaUseCase,
    ListarVendasUseCase,
    ObterVendaUseCase,
    CancelarVendaUseCase,
    {
      provide: VENDAS_REPOSITORY_FACTORY,
      useValue: (tx: ConstructorParameters<typeof PrismaVendasRepository>[0], empresaId: string) =>
        new PrismaVendasRepository(tx, empresaId),
    },
  ],
})
export class VendasModule {}
