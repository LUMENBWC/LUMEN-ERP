import { Module } from '@nestjs/common';
import { PRODUTOS_REPOSITORY_FACTORY } from '../application/ports/produtos-repository.factory';
import { AtualizarProdutoUseCase } from '../application/use-cases/atualizar-produto.use-case';
import { CriarProdutoUseCase } from '../application/use-cases/criar-produto.use-case';
import { DefinirAtivoProdutoUseCase } from '../application/use-cases/definir-ativo-produto.use-case';
import { ListarAbaixoDoMinimoUseCase } from '../application/use-cases/listar-abaixo-do-minimo.use-case';
import { ListarProdutosUseCase } from '../application/use-cases/listar-produtos.use-case';
import { ObterProdutoUseCase } from '../application/use-cases/obter-produto.use-case';
import { PrismaProdutosRepository } from '../infra/prisma-produtos.repository';
import { ProdutosController } from './produtos.controller';

@Module({
  controllers: [ProdutosController],
  providers: [
    CriarProdutoUseCase,
    ListarProdutosUseCase,
    ObterProdutoUseCase,
    AtualizarProdutoUseCase,
    DefinirAtivoProdutoUseCase,
    ListarAbaixoDoMinimoUseCase,
    {
      provide: PRODUTOS_REPOSITORY_FACTORY,
      useValue: (
        tx: ConstructorParameters<typeof PrismaProdutosRepository>[0],
        empresaId: string,
      ) => new PrismaProdutosRepository(tx, empresaId),
    },
  ],
})
export class ProdutosModule {}
