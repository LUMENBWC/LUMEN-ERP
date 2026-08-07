import { Prisma } from '../../../../../generated/prisma/client';
import { CaixaNaoAbertoError } from '../../domain/caixa.errors';
import { FecharCaixaUseCase } from './fechar-caixa.use-case';
import {
  TENANT_FIXTURE,
  caixaSessaoFixture,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  movimentoCaixaFixture,
} from './test-helpers';

describe('FecharCaixaUseCase', () => {
  it('fecha o caixa calculando o valor esperado e a diferença', async () => {
    const repo = createMockRepo();
    repo.sessaoAbertaDaEmpresa.mockResolvedValue(caixaSessaoFixture());
    repo.listarMovimentos.mockResolvedValue([
      movimentoCaixaFixture({ tipo: 'ABERTURA' }),
      movimentoCaixaFixture({ id: 'movimento-2', tipo: 'VENDA', valor: new Prisma.Decimal(30) }),
    ]);
    repo.fechar.mockResolvedValue(caixaSessaoFixture({ status: 'FECHADO' }));
    const useCase = new FecharCaixaUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await useCase.execute(TENANT_FIXTURE, { valorFechamentoInformado: 130, observacoes: null });

    expect(repo.fechar).toHaveBeenCalledWith(
      expect.objectContaining({ caixaSessaoId: 'caixa-sessao-1' }),
    );
    expect(repo.registrarMovimento).toHaveBeenCalledWith(
      expect.objectContaining({ caixaSessaoId: 'caixa-sessao-1', tipo: 'FECHAMENTO' }),
      TENANT_FIXTURE.usuarioId,
    );
  });

  it('rejeita quando não há caixa aberto', async () => {
    const repo = createMockRepo();
    repo.sessaoAbertaDaEmpresa.mockResolvedValue(null);
    const useCase = new FecharCaixaUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(
      useCase.execute(TENANT_FIXTURE, { valorFechamentoInformado: 100, observacoes: null }),
    ).rejects.toBeInstanceOf(CaixaNaoAbertoError);
  });
});
