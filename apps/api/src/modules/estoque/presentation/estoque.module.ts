import { Module } from '@nestjs/common';
import { ESTOQUE_REPOSITORY_FACTORY } from '../application/ports/estoque-repository.factory';
import { ListarMovimentacoesUseCase } from '../application/use-cases/listar-movimentacoes.use-case';
import { RegistrarAjusteUseCase } from '../application/use-cases/registrar-ajuste.use-case';
import { RegistrarEntradaUseCase } from '../application/use-cases/registrar-entrada.use-case';
import { RegistrarPerdaUseCase } from '../application/use-cases/registrar-perda.use-case';
import { PrismaEstoqueRepository } from '../infra/prisma-estoque.repository';
import { EstoqueController } from './estoque.controller';

@Module({
  controllers: [EstoqueController],
  providers: [
    RegistrarEntradaUseCase,
    RegistrarAjusteUseCase,
    RegistrarPerdaUseCase,
    ListarMovimentacoesUseCase,
    {
      provide: ESTOQUE_REPOSITORY_FACTORY,
      useValue: (tx: ConstructorParameters<typeof PrismaEstoqueRepository>[0], empresaId: string) =>
        new PrismaEstoqueRepository(tx, empresaId),
    },
  ],
  exports: [ESTOQUE_REPOSITORY_FACTORY],
})
export class EstoqueModule {}
