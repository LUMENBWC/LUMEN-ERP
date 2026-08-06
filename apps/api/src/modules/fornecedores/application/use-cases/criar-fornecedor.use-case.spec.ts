import { DocumentoInvalidoError, DocumentoJaCadastradoError } from '../../domain/fornecedor.errors';
import type { CriarFornecedorDto } from '../dto/criar-fornecedor.dto';
import { CriarFornecedorUseCase } from './criar-fornecedor.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  fornecedorFixture,
} from './test-helpers';

const dto: CriarFornecedorDto = {
  tipoPessoa: 'JURIDICA',
  nome: 'Distribuidora Exemplo LTDA',
  documento: '11.222.333/0001-81',
  telefone: null,
  email: null,
  logradouro: null,
  numero: null,
  complemento: null,
  bairro: null,
  cidade: null,
  uf: null,
  cep: null,
  observacoes: null,
};

describe('CriarFornecedorUseCase', () => {
  it('cria o fornecedor quando o documento é válido e único', async () => {
    const repo = createMockRepo();
    repo.existeDocumento.mockResolvedValue(false);
    const criado = fornecedorFixture();
    repo.criar.mockResolvedValue(criado);
    const auditLog = createMockAuditLog();
    const useCase = new CriarFornecedorUseCase(createFakeTxRunner(), () => repo, auditLog);

    const resultado = await useCase.execute(TENANT_FIXTURE, dto);

    expect(resultado).toBe(criado);
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'CRIAR' }),
    );
  });

  it('rejeita um CNPJ com dígito verificador inválido', async () => {
    const repo = createMockRepo();
    const useCase = new CriarFornecedorUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, { ...dto, documento: '11.222.333/0001-82' }),
    ).rejects.toBeInstanceOf(DocumentoInvalidoError);
    expect(repo.existeDocumento).not.toHaveBeenCalled();
    expect(repo.criar).not.toHaveBeenCalled();
  });

  it('rejeita documento já cadastrado na empresa', async () => {
    const repo = createMockRepo();
    repo.existeDocumento.mockResolvedValue(true);
    const useCase = new CriarFornecedorUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(
      DocumentoJaCadastradoError,
    );
    expect(repo.criar).not.toHaveBeenCalled();
  });
});
