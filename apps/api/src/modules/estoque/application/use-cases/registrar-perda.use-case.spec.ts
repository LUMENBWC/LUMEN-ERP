import { Prisma } from '../../../../../generated/prisma/client';
import { EstoqueInsuficienteError, ProdutoNaoEncontradoError } from '../../domain/estoque.errors';
import type { RegistrarPerdaDto } from '../dto/registrar-perda.dto';
import { RegistrarPerdaUseCase } from './registrar-perda.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  movimentacaoFixture,
  produtoParaMovimentacaoFixture,
} from './test-helpers';

const dto: RegistrarPerdaDto = {
  produtoId: 'produto-1',
  quantidade: 10,
  motivo: 'Produto danificado na prateleira',
};

describe('RegistrarPerdaUseCase', () => {
  it('registra a perda como um delta negativo', async () => {
    const repo = createMockRepo();
    repo.obterProdutoComLock.mockResolvedValue(produtoParaMovimentacaoFixture());
    const registrada = movimentacaoFixture({ tipo: 'PERDA' });
    repo.registrarDelta.mockResolvedValue(registrada);
    const auditLog = createMockAuditLog();
    const useCase = new RegistrarPerdaUseCase(createFakeTxRunner(), () => repo, auditLog);

    const resultado = await useCase.execute(TENANT_FIXTURE, dto);

    expect(resultado).toBe(registrada);
    const inputPassado = repo.registrarDelta.mock.calls[0][0];
    expect(inputPassado.delta.toString()).toBe('-10');
    expect(inputPassado.saldoApos.toString()).toBe('90');
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'PERDA' }),
    );
  });

  it('rejeita produto inexistente', async () => {
    const repo = createMockRepo();
    repo.obterProdutoComLock.mockResolvedValue(null);
    const useCase = new RegistrarPerdaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(
      ProdutoNaoEncontradoError,
    );
  });

  it('rejeita perda maior que o estoque disponível sem a permissão estoque.ajustarNegativo', async () => {
    const repo = createMockRepo();
    repo.obterProdutoComLock.mockResolvedValue(
      produtoParaMovimentacaoFixture({ estoqueAtual: new Prisma.Decimal(3) }),
    );
    const useCase = new RegistrarPerdaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(
      EstoqueInsuficienteError,
    );
    expect(repo.registrarDelta).not.toHaveBeenCalled();
  });
});
