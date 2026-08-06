import { Prisma } from '../../../../../generated/prisma/client';
import { FornecedorInvalidoError, ProdutoNaoEncontradoError } from '../../domain/estoque.errors';
import type { RegistrarEntradaDto } from '../dto/registrar-entrada.dto';
import { RegistrarEntradaUseCase } from './registrar-entrada.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  movimentacaoFixture,
  produtoParaMovimentacaoFixture,
} from './test-helpers';

const dto: RegistrarEntradaDto = {
  produtoId: 'produto-1',
  quantidade: 50,
  custoUnitario: 7,
  fornecedorId: null,
  motivo: null,
};

describe('RegistrarEntradaUseCase', () => {
  it('calcula o custo médio ponderado e registra a entrada', async () => {
    const repo = createMockRepo();
    repo.obterProdutoComLock.mockResolvedValue(
      produtoParaMovimentacaoFixture({
        estoqueAtual: new Prisma.Decimal(100),
        precoCusto: new Prisma.Decimal(5),
      }),
    );
    const registrada = movimentacaoFixture();
    repo.registrarEntrada.mockResolvedValue(registrada);
    const auditLog = createMockAuditLog();
    const useCase = new RegistrarEntradaUseCase(createFakeTxRunner(), () => repo, auditLog);

    const resultado = await useCase.execute(TENANT_FIXTURE, dto);

    expect(resultado).toBe(registrada);
    const inputPassado = repo.registrarEntrada.mock.calls[0][0];
    // (100*5 + 50*7) / 150 = (500 + 350) / 150 = 5.6666... -> 5.67
    expect(inputPassado.novoCustoMedio.toString()).toBe('5.67');
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'ENTRADA_COMPRA' }),
    );
  });

  it('rejeita produto inexistente', async () => {
    const repo = createMockRepo();
    repo.obterProdutoComLock.mockResolvedValue(null);
    const useCase = new RegistrarEntradaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(
      ProdutoNaoEncontradoError,
    );
    expect(repo.registrarEntrada).not.toHaveBeenCalled();
  });

  it('rejeita fornecedor inexistente quando informado', async () => {
    const repo = createMockRepo();
    repo.obterProdutoComLock.mockResolvedValue(produtoParaMovimentacaoFixture());
    repo.fornecedorExiste.mockResolvedValue(false);
    const useCase = new RegistrarEntradaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, { ...dto, fornecedorId: 'fornecedor-1' }),
    ).rejects.toBeInstanceOf(FornecedorInvalidoError);
    expect(repo.registrarEntrada).not.toHaveBeenCalled();
  });
});
