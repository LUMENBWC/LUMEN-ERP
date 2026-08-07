import { Module } from '@nestjs/common';
import { CAIXA_REPOSITORY_FACTORY } from '../application/ports/caixa-repository.factory';
import { AbrirCaixaUseCase } from '../application/use-cases/abrir-caixa.use-case';
import { ObterCaixaAbertoUseCase } from '../application/use-cases/obter-caixa-aberto.use-case';
import { PrismaCaixaRepository } from '../infra/prisma-caixa.repository';
import { CaixaController } from './caixa.controller';

@Module({
  controllers: [CaixaController],
  providers: [
    AbrirCaixaUseCase,
    ObterCaixaAbertoUseCase,
    {
      provide: CAIXA_REPOSITORY_FACTORY,
      useValue: (tx: ConstructorParameters<typeof PrismaCaixaRepository>[0], empresaId: string) =>
        new PrismaCaixaRepository(tx, empresaId),
    },
  ],
  exports: [CAIXA_REPOSITORY_FACTORY],
})
export class CaixaModule {}
