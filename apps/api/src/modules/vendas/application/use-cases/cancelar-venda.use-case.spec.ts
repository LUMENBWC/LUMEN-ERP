import {
  createMockRepo as createMockEstoqueRepo,
  produtoParaMovimentacaoFixture,
} from '../../../estoque/application/use-cases/test-helpers';
import { VendaJaCanceladaError, VendaNaoEncontradaError } from '../../domain/venda.errors';
import { CancelarVendaUseCase } from './cancelar-venda.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockVendasRepo,
  vendaDetalhadaFixture,
} from './test-helpers';

function setupUseCase() {
  const vendasRepo = createMockVendasRepo();
  const estoqueRepo = createMockEstoqueRepo();
  const auditLog = createMockAuditLog();

  const useCase = new CancelarVendaUseCase(
    createFakeTxRunner(),
    () => vendasRepo,
    () => estoqueRepo,
    auditLog,
  );

  return { useCase, vendasRepo, estoqueRepo, auditLog };
}

describe('CancelarVendaUseCase', () => {
  it('cancela a venda e estorna o estoque de cada item', async () => {
    const { useCase, vendasRepo, estoqueRepo } = setupUseCase();
    vendasRepo.obterPorId.mockResolvedValue(vendaDetalhadaFixture());
    estoqueRepo.obterProdutoComLock.mockResolvedValue(produtoParaMovimentacaoFixture());

    await useCase.execute(TENANT_FIXTURE, 'venda-1');

    expect(estoqueRepo.registrarDelta).toHaveBeenCalledWith(
      expect.objectContaining({
        produtoId: 'produto-1',
        tipo: 'AJUSTE_MANUAL',
        origemId: 'venda-1',
      }),
      TENANT_FIXTURE.usuarioId,
    );
    expect(vendasRepo.cancelar).toHaveBeenCalledWith('venda-1');
  });

  it('rejeita cancelar uma venda inexistente', async () => {
    const { useCase, vendasRepo } = setupUseCase();
    vendasRepo.obterPorId.mockResolvedValue(null);

    await expect(useCase.execute(TENANT_FIXTURE, 'venda-1')).rejects.toBeInstanceOf(
      VendaNaoEncontradaError,
    );
  });

  it('rejeita cancelar uma venda já cancelada', async () => {
    const { useCase, vendasRepo } = setupUseCase();
    vendasRepo.obterPorId.mockResolvedValue(vendaDetalhadaFixture({ status: 'CANCELADA' }));

    await expect(useCase.execute(TENANT_FIXTURE, 'venda-1')).rejects.toBeInstanceOf(
      VendaJaCanceladaError,
    );
    expect(vendasRepo.cancelar).not.toHaveBeenCalled();
  });
});
