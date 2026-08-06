import { Module } from '@nestjs/common';
import { FORNECEDORES_REPOSITORY_FACTORY } from '../application/ports/fornecedores-repository.factory';
import { AtualizarFornecedorUseCase } from '../application/use-cases/atualizar-fornecedor.use-case';
import { CriarFornecedorUseCase } from '../application/use-cases/criar-fornecedor.use-case';
import { DefinirAtivoFornecedorUseCase } from '../application/use-cases/definir-ativo-fornecedor.use-case';
import { DesvincularProdutoUseCase } from '../application/use-cases/desvincular-produto.use-case';
import { ListarFornecedoresUseCase } from '../application/use-cases/listar-fornecedores.use-case';
import { ObterFornecedorUseCase } from '../application/use-cases/obter-fornecedor.use-case';
import { VincularProdutoUseCase } from '../application/use-cases/vincular-produto.use-case';
import { PrismaFornecedoresRepository } from '../infra/prisma-fornecedores.repository';
import { FornecedoresController } from './fornecedores.controller';

@Module({
  controllers: [FornecedoresController],
  providers: [
    CriarFornecedorUseCase,
    ListarFornecedoresUseCase,
    ObterFornecedorUseCase,
    AtualizarFornecedorUseCase,
    DefinirAtivoFornecedorUseCase,
    VincularProdutoUseCase,
    DesvincularProdutoUseCase,
    {
      provide: FORNECEDORES_REPOSITORY_FACTORY,
      useValue: (
        tx: ConstructorParameters<typeof PrismaFornecedoresRepository>[0],
        empresaId: string,
      ) => new PrismaFornecedoresRepository(tx, empresaId),
    },
  ],
})
export class FornecedoresModule {}
