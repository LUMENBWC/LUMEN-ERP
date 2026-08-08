import { Module } from '@nestjs/common';
import { FINANCEIRO_REPOSITORY_FACTORY } from '../application/ports/financeiro-repository.factory';
import { CancelarContaPagarUseCase } from '../application/use-cases/cancelar-conta-pagar.use-case';
import { CriarCategoriaDespesaUseCase } from '../application/use-cases/criar-categoria-despesa.use-case';
import { CriarContaPagarUseCase } from '../application/use-cases/criar-conta-pagar.use-case';
import { ListarCategoriasDespesaUseCase } from '../application/use-cases/listar-categorias-despesa.use-case';
import { ListarContasPagarUseCase } from '../application/use-cases/listar-contas-pagar.use-case';
import { ListarContasReceberUseCase } from '../application/use-cases/listar-contas-receber.use-case';
import { ObterContaPagarUseCase } from '../application/use-cases/obter-conta-pagar.use-case';
import { ObterContaReceberUseCase } from '../application/use-cases/obter-conta-receber.use-case';
import { RegistrarPagamentoUseCase } from '../application/use-cases/registrar-pagamento.use-case';
import { RegistrarRecebimentoUseCase } from '../application/use-cases/registrar-recebimento.use-case';
import { PrismaFinanceiroRepository } from '../infra/prisma-financeiro.repository';
import { FinanceiroController } from './financeiro.controller';

@Module({
  controllers: [FinanceiroController],
  providers: [
    ListarContasReceberUseCase,
    ObterContaReceberUseCase,
    RegistrarRecebimentoUseCase,
    CriarCategoriaDespesaUseCase,
    ListarCategoriasDespesaUseCase,
    CriarContaPagarUseCase,
    ListarContasPagarUseCase,
    ObterContaPagarUseCase,
    RegistrarPagamentoUseCase,
    CancelarContaPagarUseCase,
    {
      provide: FINANCEIRO_REPOSITORY_FACTORY,
      useValue: (
        tx: ConstructorParameters<typeof PrismaFinanceiroRepository>[0],
        empresaId: string,
      ) => new PrismaFinanceiroRepository(tx, empresaId),
    },
  ],
})
export class FinanceiroModule {}
