import { Prisma } from '../../../../../generated/prisma/client';
import {
  caixaSessaoFixture,
  createMockRepo as createMockCaixaRepo,
} from '../../../caixa/application/use-cases/test-helpers';
import { createMockRepo as createMockEstoqueRepo } from '../../../estoque/application/use-cases/test-helpers';
import { orcamentoFixture } from '../../../orcamentos/application/use-cases/test-helpers';
import {
  CaixaFechadoError,
  ClienteInvalidoError,
  DescontoNaoAutorizadoError,
  EstoqueInsuficienteError,
  OrcamentoInvalidoError,
  OrcamentoNaoConversivelError,
  PagamentoDivergenteError,
  ProdutoInvalidoError,
} from '../../domain/venda.errors';
import type { FinalizarVendaDto } from '../dto/finalizar-venda.dto';
import { FinalizarVendaUseCase } from './finalizar-venda.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockOrcamentosRepo,
  createMockVendasRepo,
  produtoParaVendaFixture,
  vendaDetalhadaFixture,
} from './test-helpers';

function baseDto(overrides: Partial<FinalizarVendaDto> = {}): FinalizarVendaDto {
  return {
    orcamentoId: null,
    clienteId: null,
    itens: [{ produtoId: 'produto-1', quantidade: 10, precoUnitario: 10, desconto: 0 }],
    descontoGeral: 0,
    pagamentos: [{ formaPagamento: 'DINHEIRO', valor: 100, parcelas: 1, bandeira: null }],
    ...overrides,
  };
}

function setupUseCase() {
  const vendasRepo = createMockVendasRepo();
  const estoqueRepo = createMockEstoqueRepo();
  const caixaRepo = createMockCaixaRepo();
  const orcamentosRepo = createMockOrcamentosRepo();
  const auditLog = createMockAuditLog();

  vendasRepo.obterProdutosComLock.mockResolvedValue(
    new Map([['produto-1', produtoParaVendaFixture()]]),
  );
  vendasRepo.criar.mockResolvedValue(vendaDetalhadaFixture());

  const useCase = new FinalizarVendaUseCase(
    createFakeTxRunner(),
    () => vendasRepo,
    () => estoqueRepo,
    () => caixaRepo,
    () => orcamentosRepo,
    auditLog,
  );

  return { useCase, vendasRepo, estoqueRepo, caixaRepo, orcamentosRepo, auditLog };
}

describe('FinalizarVendaUseCase', () => {
  it('finaliza uma venda em dinheiro com caixa aberto, baixando estoque e quitando a conta a receber', async () => {
    const { useCase, vendasRepo, estoqueRepo, caixaRepo } = setupUseCase();
    caixaRepo.sessaoAbertaDaEmpresa.mockResolvedValue(caixaSessaoFixture());

    const resultado = await useCase.execute(TENANT_FIXTURE, baseDto());

    expect(resultado.id).toBe('venda-1');
    expect(vendasRepo.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        caixaSessaoId: 'caixa-sessao-1',
        contasReceber: [expect.objectContaining({ status: 'PAGO' })],
      }),
      TENANT_FIXTURE.usuarioId,
    );
    expect(estoqueRepo.registrarDelta).toHaveBeenCalledWith(
      expect.objectContaining({ produtoId: 'produto-1', tipo: 'SAIDA_VENDA', origemId: 'venda-1' }),
      TENANT_FIXTURE.usuarioId,
    );
    expect(caixaRepo.registrarMovimento).toHaveBeenCalledWith(
      expect.objectContaining({ caixaSessaoId: 'caixa-sessao-1', tipo: 'VENDA' }),
      TENANT_FIXTURE.usuarioId,
    );
  });

  it('rejeita quando o cliente informado não existe', async () => {
    const { useCase, vendasRepo, caixaRepo } = setupUseCase();
    vendasRepo.clienteExiste.mockResolvedValue(false);
    caixaRepo.sessaoAbertaDaEmpresa.mockResolvedValue(caixaSessaoFixture());

    await expect(
      useCase.execute(TENANT_FIXTURE, baseDto({ clienteId: 'cliente-1' })),
    ).rejects.toBeInstanceOf(ClienteInvalidoError);
  });

  it('rejeita quando um produto do carrinho não existe', async () => {
    const { useCase, vendasRepo } = setupUseCase();
    vendasRepo.obterProdutosComLock.mockResolvedValue(new Map());

    await expect(useCase.execute(TENANT_FIXTURE, baseDto())).rejects.toBeInstanceOf(
      ProdutoInvalidoError,
    );
  });

  it('rejeita quando a soma dos pagamentos diverge do total da venda', async () => {
    const { useCase } = setupUseCase();

    await expect(
      useCase.execute(
        TENANT_FIXTURE,
        baseDto({
          pagamentos: [{ formaPagamento: 'DINHEIRO', valor: 50, parcelas: 1, bandeira: null }],
        }),
      ),
    ).rejects.toBeInstanceOf(PagamentoDivergenteError);
  });

  it('rejeita quando o estoque é insuficiente para a quantidade vendida', async () => {
    const { useCase, vendasRepo } = setupUseCase();
    vendasRepo.obterProdutosComLock.mockResolvedValue(
      new Map([['produto-1', produtoParaVendaFixture({ estoqueAtual: new Prisma.Decimal(5) })]]),
    );

    await expect(useCase.execute(TENANT_FIXTURE, baseDto())).rejects.toBeInstanceOf(
      EstoqueInsuficienteError,
    );
  });

  it('rejeita pagamento em dinheiro quando não há caixa aberto', async () => {
    const { useCase, caixaRepo } = setupUseCase();
    caixaRepo.sessaoAbertaDaEmpresa.mockResolvedValue(null);

    await expect(useCase.execute(TENANT_FIXTURE, baseDto())).rejects.toBeInstanceOf(
      CaixaFechadoError,
    );
  });

  it('não exige caixa aberto para pagamento não-dinheiro', async () => {
    const { useCase, caixaRepo } = setupUseCase();
    caixaRepo.sessaoAbertaDaEmpresa.mockResolvedValue(null);

    const resultado = await useCase.execute(
      TENANT_FIXTURE,
      baseDto({ pagamentos: [{ formaPagamento: 'PIX', valor: 100, parcelas: 1, bandeira: null }] }),
    );

    expect(resultado.id).toBe('venda-1');
    expect(caixaRepo.registrarMovimento).not.toHaveBeenCalled();
  });

  it('rejeita desconto quando o usuário não tem a permissão vendas.aplicarDesconto', async () => {
    const { useCase, caixaRepo } = setupUseCase();
    caixaRepo.sessaoAbertaDaEmpresa.mockResolvedValue(caixaSessaoFixture());
    const tenantSemPermissao = {
      ...TENANT_FIXTURE,
      permissoes: new Set(['vendas.criar']),
    };

    await expect(
      useCase.execute(
        tenantSemPermissao,
        baseDto({
          itens: [{ produtoId: 'produto-1', quantidade: 10, precoUnitario: 10, desconto: 5 }],
          pagamentos: [{ formaPagamento: 'DINHEIRO', valor: 95, parcelas: 1, bandeira: null }],
        }),
      ),
    ).rejects.toBeInstanceOf(DescontoNaoAutorizadoError);
  });

  it('gera contas a receber parceladas para pagamento a prazo/parcelado', async () => {
    const { useCase, vendasRepo } = setupUseCase();

    await useCase.execute(
      TENANT_FIXTURE,
      baseDto({
        pagamentos: [{ formaPagamento: 'A_PRAZO', valor: 100, parcelas: 2, bandeira: null }],
      }),
    );

    expect(vendasRepo.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        contasReceber: [
          expect.objectContaining({ status: 'ABERTO', parcelaNumero: 1, parcelaTotal: 2 }),
          expect.objectContaining({ status: 'ABERTO', parcelaNumero: 2, parcelaTotal: 2 }),
        ],
      }),
      TENANT_FIXTURE.usuarioId,
    );
  });

  describe('conversão de orçamento em venda', () => {
    function dtoConversao(overrides: Partial<FinalizarVendaDto> = {}): FinalizarVendaDto {
      return baseDto({
        orcamentoId: 'orcamento-1',
        itens: [],
        pagamentos: [{ formaPagamento: 'DINHEIRO', valor: 100, parcelas: 1, bandeira: null }],
        ...overrides,
      });
    }

    it('converte um orçamento aprovado, reaproveitando itens/cliente/desconto dele', async () => {
      const { useCase, vendasRepo, orcamentosRepo, caixaRepo } = setupUseCase();
      orcamentosRepo.obterPorId.mockResolvedValue(orcamentoFixture({ status: 'APROVADO' }));
      vendasRepo.clienteExiste.mockResolvedValue(true);
      caixaRepo.sessaoAbertaDaEmpresa.mockResolvedValue(caixaSessaoFixture());

      const resultado = await useCase.execute(TENANT_FIXTURE, dtoConversao());

      expect(resultado.id).toBe('venda-1');
      expect(vendasRepo.criar).toHaveBeenCalledWith(
        expect.objectContaining({ clienteId: 'cliente-1', orcamentoId: 'orcamento-1' }),
        TENANT_FIXTURE.usuarioId,
      );
      expect(orcamentosRepo.atualizarStatus).toHaveBeenCalledWith(
        'orcamento-1',
        'CONVERTIDO',
        TENANT_FIXTURE.usuarioId,
      );
    });

    it('rejeita quando o orçamento não existe', async () => {
      const { useCase, orcamentosRepo } = setupUseCase();
      orcamentosRepo.obterPorId.mockResolvedValue(null);

      await expect(useCase.execute(TENANT_FIXTURE, dtoConversao())).rejects.toBeInstanceOf(
        OrcamentoInvalidoError,
      );
    });

    it('rejeita quando o orçamento não está com status APROVADO', async () => {
      const { useCase, orcamentosRepo } = setupUseCase();
      orcamentosRepo.obterPorId.mockResolvedValue(orcamentoFixture({ status: 'RASCUNHO' }));

      await expect(useCase.execute(TENANT_FIXTURE, dtoConversao())).rejects.toBeInstanceOf(
        OrcamentoNaoConversivelError,
      );
      expect(orcamentosRepo.atualizarStatus).not.toHaveBeenCalled();
    });
  });
});
