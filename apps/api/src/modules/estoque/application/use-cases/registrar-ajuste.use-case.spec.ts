import { Prisma } from '../../../../../generated/prisma/client';
import { EstoqueInsuficienteError, ProdutoNaoEncontradoError } from '../../domain/estoque.errors';
import type { RegistrarAjusteDto } from '../dto/registrar-ajuste.dto';
import { RegistrarAjusteUseCase } from './registrar-ajuste.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  movimentacaoFixture,
  produtoParaMovimentacaoFixture,
} from './test-helpers';

const dto: RegistrarAjusteDto = {
  produtoId: 'produto-1',
  quantidade: -10,
  motivo: 'Contagem de inventário divergente',
};

describe('RegistrarAjusteUseCase', () => {
  it('registra um ajuste que mantém o saldo não-negativo', async () => {
    const repo = createMockRepo();
    repo.obterProdutoComLock.mockResolvedValue(produtoParaMovimentacaoFixture());
    const registrada = movimentacaoFixture({ tipo: 'AJUSTE_MANUAL' });
    repo.registrarDelta.mockResolvedValue(registrada);
    const auditLog = createMockAuditLog();
    const useCase = new RegistrarAjusteUseCase(createFakeTxRunner(), () => repo, auditLog);

    const resultado = await useCase.execute(TENANT_FIXTURE, dto);

    expect(resultado).toBe(registrada);
    const inputPassado = repo.registrarDelta.mock.calls[0][0];
    expect(inputPassado.saldoApos.toString()).toBe('90');
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'AJUSTE_MANUAL' }),
    );
  });

  it('rejeita produto inexistente', async () => {
    const repo = createMockRepo();
    repo.obterProdutoComLock.mockResolvedValue(null);
    const useCase = new RegistrarAjusteUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(
      ProdutoNaoEncontradoError,
    );
  });

  it('rejeita ajuste que deixaria o estoque negativo sem a permissão estoque.ajustarNegativo', async () => {
    const repo = createMockRepo();
    repo.obterProdutoComLock.mockResolvedValue(
      produtoParaMovimentacaoFixture({
        estoqueAtual: new Prisma.Decimal(5),
      }),
    );
    const useCase = new RegistrarAjusteUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(
      EstoqueInsuficienteError,
    );
    expect(repo.registrarDelta).not.toHaveBeenCalled();
  });

  it('permite o ajuste negativo quando o usuário tem a permissão estoque.ajustarNegativo', async () => {
    const repo = createMockRepo();
    repo.obterProdutoComLock.mockResolvedValue(
      produtoParaMovimentacaoFixture({
        estoqueAtual: new Prisma.Decimal(5),
      }),
    );
    repo.registrarDelta.mockResolvedValue(movimentacaoFixture({ tipo: 'AJUSTE_MANUAL' }));
    const tenantComPermissao = {
      ...TENANT_FIXTURE,
      permissoes: new Set([...TENANT_FIXTURE.permissoes, 'estoque.ajustarNegativo']),
    };
    const useCase = new RegistrarAjusteUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await useCase.execute(tenantComPermissao, dto);

    const inputPassado = repo.registrarDelta.mock.calls[0][0];
    expect(inputPassado.saldoApos.toString()).toBe('-5');
  });
});
