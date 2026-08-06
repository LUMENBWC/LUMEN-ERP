import { Module } from '@nestjs/common';
import { CLIENTES_REPOSITORY_FACTORY } from '../application/ports/clientes-repository.factory';
import { AtualizarClienteUseCase } from '../application/use-cases/atualizar-cliente.use-case';
import { CriarClienteUseCase } from '../application/use-cases/criar-cliente.use-case';
import { DefinirAtivoClienteUseCase } from '../application/use-cases/definir-ativo-cliente.use-case';
import { ListarClientesUseCase } from '../application/use-cases/listar-clientes.use-case';
import { ObterClienteUseCase } from '../application/use-cases/obter-cliente.use-case';
import { PrismaClientesRepository } from '../infra/prisma-clientes.repository';
import { ClientesController } from './clientes.controller';

@Module({
  controllers: [ClientesController],
  providers: [
    CriarClienteUseCase,
    ListarClientesUseCase,
    ObterClienteUseCase,
    AtualizarClienteUseCase,
    DefinirAtivoClienteUseCase,
    {
      provide: CLIENTES_REPOSITORY_FACTORY,
      useValue: (
        tx: ConstructorParameters<typeof PrismaClientesRepository>[0],
        empresaId: string,
      ) => new PrismaClientesRepository(tx, empresaId),
    },
  ],
})
export class ClientesModule {}
