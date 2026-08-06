import { Module } from '@nestjs/common';
import { CATEGORIAS_REPOSITORY_FACTORY } from '../application/ports/categorias-repository.factory';
import { AtualizarCategoriaUseCase } from '../application/use-cases/atualizar-categoria.use-case';
import { CriarCategoriaUseCase } from '../application/use-cases/criar-categoria.use-case';
import { DefinirAtivoCategoriaUseCase } from '../application/use-cases/definir-ativo-categoria.use-case';
import { ListarCategoriasUseCase } from '../application/use-cases/listar-categorias.use-case';
import { ObterCategoriaUseCase } from '../application/use-cases/obter-categoria.use-case';
import { PrismaCategoriasRepository } from '../infra/prisma-categorias.repository';
import { CategoriasController } from './categorias.controller';

@Module({
  controllers: [CategoriasController],
  providers: [
    CriarCategoriaUseCase,
    ListarCategoriasUseCase,
    ObterCategoriaUseCase,
    AtualizarCategoriaUseCase,
    DefinirAtivoCategoriaUseCase,
    {
      provide: CATEGORIAS_REPOSITORY_FACTORY,
      useValue: (
        tx: ConstructorParameters<typeof PrismaCategoriasRepository>[0],
        empresaId: string,
      ) => new PrismaCategoriasRepository(tx, empresaId),
    },
  ],
})
export class CategoriasModule {}
