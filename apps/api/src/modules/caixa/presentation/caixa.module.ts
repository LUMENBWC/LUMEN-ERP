import { Module } from '@nestjs/common';
import { CAIXA_REPOSITORY_FACTORY } from '../application/ports/caixa-repository.factory';
import { AbrirCaixaUseCase } from '../application/use-cases/abrir-caixa.use-case';
import { FecharCaixaUseCase } from '../application/use-cases/fechar-caixa.use-case';
import { ListarSessoesUseCase } from '../application/use-cases/listar-sessoes.use-case';
import { ObterCaixaAbertoUseCase } from '../application/use-cases/obter-caixa-aberto.use-case';
import { ObterSessaoUseCase } from '../application/use-cases/obter-sessao.use-case';
import { RegistrarSangriaUseCase } from '../application/use-cases/registrar-sangria.use-case';
import { RegistrarSuprimentoUseCase } from '../application/use-cases/registrar-suprimento.use-case';
import { PrismaCaixaRepository } from '../infra/prisma-caixa.repository';
import { CaixaController } from './caixa.controller';

@Module({
  controllers: [CaixaController],
  providers: [
    AbrirCaixaUseCase,
    ObterCaixaAbertoUseCase,
    RegistrarSangriaUseCase,
    RegistrarSuprimentoUseCase,
    FecharCaixaUseCase,
    ListarSessoesUseCase,
    ObterSessaoUseCase,
    {
      provide: CAIXA_REPOSITORY_FACTORY,
      useValue: (tx: ConstructorParameters<typeof PrismaCaixaRepository>[0], empresaId: string) =>
        new PrismaCaixaRepository(tx, empresaId),
    },
  ],
  exports: [CAIXA_REPOSITORY_FACTORY],
})
export class CaixaModule {}
