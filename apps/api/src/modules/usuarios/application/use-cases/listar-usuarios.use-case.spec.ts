import { ListarUsuariosUseCase } from './listar-usuarios.use-case';
import { TENANT_FIXTURE, createFakeTxRunner, createMockRepo, usuarioFixture } from './test-helpers';

describe('ListarUsuariosUseCase', () => {
  it('repassa o filtro pro repositório e retorna o resultado', async () => {
    const repo = createMockRepo();
    const resultado = { items: [usuarioFixture()], total: 1 };
    repo.listar.mockResolvedValue(resultado);
    const useCase = new ListarUsuariosUseCase(createFakeTxRunner(), () => repo);

    const query = {
      busca: 'ana',
      ativo: true,
      papelId: undefined,
      page: 2,
      perPage: 10,
      sortBy: 'nome' as const,
      sortDir: 'asc' as const,
    };

    const saida = await useCase.execute(TENANT_FIXTURE, query);

    expect(saida).toBe(resultado);
    expect(repo.listar).toHaveBeenCalledWith(query);
  });
});
