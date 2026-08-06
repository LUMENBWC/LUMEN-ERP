import { OrcamentoNaoEncontradoError } from '../../domain/orcamento.errors';
import type { PdfStoragePort } from '../ports/pdf-storage.port';
import { GerarPdfOrcamentoUseCase } from './gerar-pdf-orcamento.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockRepo,
  dadosPdfFixture,
} from './test-helpers';

function createMockPdfStorage(): jest.Mocked<PdfStoragePort> {
  return {
    salvar: jest.fn(),
    obterUrlAssinada: jest.fn(),
  };
}

describe('GerarPdfOrcamentoUseCase', () => {
  it('gera o PDF, salva no storage e retorna a URL assinada', async () => {
    const repo = createMockRepo();
    repo.obterDadosParaPdf.mockResolvedValue(dadosPdfFixture());
    const pdfStorage = createMockPdfStorage();
    pdfStorage.obterUrlAssinada.mockResolvedValue('https://storage.example.com/assinada.pdf');
    const useCase = new GerarPdfOrcamentoUseCase(createFakeTxRunner(), () => repo, pdfStorage);

    const resultado = await useCase.execute(TENANT_FIXTURE, 'orcamento-1');

    expect(resultado).toEqual({ url: 'https://storage.example.com/assinada.pdf' });
    expect(pdfStorage.salvar).toHaveBeenCalledWith(
      `${TENANT_FIXTURE.empresaId}/orcamento-1.pdf`,
      expect.any(Buffer),
    );
    expect(repo.salvarPdfUrl).toHaveBeenCalledWith(
      'orcamento-1',
      `${TENANT_FIXTURE.empresaId}/orcamento-1.pdf`,
    );
  });

  it('rejeita orçamento inexistente', async () => {
    const repo = createMockRepo();
    repo.obterDadosParaPdf.mockResolvedValue(null);
    const pdfStorage = createMockPdfStorage();
    const useCase = new GerarPdfOrcamentoUseCase(createFakeTxRunner(), () => repo, pdfStorage);

    await expect(useCase.execute(TENANT_FIXTURE, 'orcamento-1')).rejects.toBeInstanceOf(
      OrcamentoNaoEncontradoError,
    );
    expect(pdfStorage.salvar).not.toHaveBeenCalled();
  });
});
