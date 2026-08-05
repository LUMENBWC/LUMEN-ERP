import { Module } from '@nestjs/common';
import { PAPEIS_REPOSITORY_FACTORY } from '../application/ports/papeis-repository.factory';
import { ListarPapeisUseCase } from '../application/use-cases/listar-papeis.use-case';
import { ListarPermissoesUseCase } from '../application/use-cases/listar-permissoes.use-case';
import { PrismaPapeisRepository } from '../infra/prisma-papeis.repository';
import { PapeisController } from './papeis.controller';

@Module({
  controllers: [PapeisController],
  providers: [
    ListarPapeisUseCase,
    ListarPermissoesUseCase,
    {
      provide: PAPEIS_REPOSITORY_FACTORY,
      useValue: (tx: ConstructorParameters<typeof PrismaPapeisRepository>[0]) =>
        new PrismaPapeisRepository(tx),
    },
  ],
})
export class PapeisModule {}
