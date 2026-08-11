import { DocumentoInvalidoError, DocumentoJaCadastradoError } from '../../domain/cliente.errors';
import type { CriarClienteDto } from '../dto/criar-cliente.dto';
import { CriarClienteUseCase } from './criar-cliente.use-case';
import {
  TENANT_FIXTURE,
  clienteFixture,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
} from './test-helpers';

const dto: CriarClienteDto = {
  tipoPessoa: 'FISICA',
  nome: 'João da Silva',
  documento: '111.444.777-35',
  telefone: null,
  whatsapp: null,
  email: null,
  logradouro: null,
  numero: null,
  complemento: null,
  bairro: null,
  cidade: null,
  uf: null,
  cep: null,
  inscricaoEstadual: null,
  limiteCredito: 0,
  observacoes: null,
};

describe('CriarClienteUseCase', () => {
  it('cria o cliente quando o documento é válido e único', async () => {
    const repo = createMockRepo();
    repo.existeDocumento.mockResolvedValue(false);
    const criado = clienteFixture();
    repo.criar.mockResolvedValue(criado);
    const auditLog = createMockAuditLog();
    const useCase = new CriarClienteUseCase(createFakeTxRunner(), () => repo, auditLog);

    const resultado = await useCase.execute(TENANT_FIXTURE, dto);

    expect(resultado).toBe(criado);
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'CRIAR' }),
    );
  });

  it('rejeita um CPF com dígito verificador inválido', async () => {
    const repo = createMockRepo();
    const useCase = new CriarClienteUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(
      useCase.execute(TENANT_FIXTURE, { ...dto, documento: '111.444.777-36' }),
    ).rejects.toBeInstanceOf(DocumentoInvalidoError);
    expect(repo.existeDocumento).not.toHaveBeenCalled();
    expect(repo.criar).not.toHaveBeenCalled();
  });

  it('rejeita um CNPJ inválido quando tipoPessoa é JURIDICA', async () => {
    const repo = createMockRepo();
    const useCase = new CriarClienteUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(
      useCase.execute(TENANT_FIXTURE, {
        ...dto,
        tipoPessoa: 'JURIDICA',
        documento: '11.222.333/0001-82',
      }),
    ).rejects.toBeInstanceOf(DocumentoInvalidoError);
  });

  it('rejeita documento já cadastrado na empresa', async () => {
    const repo = createMockRepo();
    repo.existeDocumento.mockResolvedValue(true);
    const useCase = new CriarClienteUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(
      DocumentoJaCadastradoError,
    );
    expect(repo.criar).not.toHaveBeenCalled();
  });
});
