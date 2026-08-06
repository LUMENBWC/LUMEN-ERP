import {
  CategoriaPaiNaoEncontradaError,
  HierarquiaExcedeUmNivelError,
  NomeCategoriaJaCadastradoError,
} from '../../domain/categoria.errors';
import type { CriarCategoriaDto } from '../dto/criar-categoria.dto';
import { CriarCategoriaUseCase } from './criar-categoria.use-case';
import {
  TENANT_FIXTURE,
  categoriaFixture,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
} from './test-helpers';

const dto: CriarCategoriaDto = { nome: 'Refrigerantes', categoriaPaiId: null };

describe('CriarCategoriaUseCase', () => {
  it('cria a categoria quando o nome não está em uso e não há pai', async () => {
    const repo = createMockRepo();
    repo.existeNome.mockResolvedValue(false);
    const criada = categoriaFixture({ nome: 'Refrigerantes' });
    repo.criar.mockResolvedValue(criada);
    const auditLog = createMockAuditLog();
    const useCase = new CriarCategoriaUseCase(createFakeTxRunner(), () => repo, auditLog);

    const resultado = await useCase.execute(TENANT_FIXTURE, dto);

    expect(resultado).toBe(criada);
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'CRIAR' }),
    );
  });

  it('rejeita quando o nome já está em uso', async () => {
    const repo = createMockRepo();
    repo.existeNome.mockResolvedValue(true);
    const useCase = new CriarCategoriaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(
      NomeCategoriaJaCadastradoError,
    );
    expect(repo.criar).not.toHaveBeenCalled();
  });

  it('rejeita quando a categoria pai informada não existe', async () => {
    const repo = createMockRepo();
    repo.existeNome.mockResolvedValue(false);
    repo.obterPorId.mockResolvedValue(null);
    const useCase = new CriarCategoriaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, { ...dto, categoriaPaiId: 'inexistente' }),
    ).rejects.toBeInstanceOf(CategoriaPaiNaoEncontradaError);
  });

  it('rejeita quando a categoria pai escolhida já é uma subcategoria', async () => {
    const repo = createMockRepo();
    repo.existeNome.mockResolvedValue(false);
    repo.obterPorId.mockResolvedValue(categoriaFixture({ id: 'pai', categoriaPaiId: 'avo' }));
    const useCase = new CriarCategoriaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, { ...dto, categoriaPaiId: 'pai' }),
    ).rejects.toBeInstanceOf(HierarquiaExcedeUmNivelError);
  });
});
