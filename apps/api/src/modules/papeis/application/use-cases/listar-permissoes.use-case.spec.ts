import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import { ListarPermissoesUseCase } from './listar-permissoes.use-case';

describe('ListarPermissoesUseCase', () => {
  it('lê o catálogo global de permissões ordenado por chave', async () => {
    const permissoes = [
      { id: '1', chave: 'produtos.ler', descricao: 'Ver produtos', createdAt: new Date() },
    ];
    const findMany = jest.fn().mockResolvedValue(permissoes);
    const prisma = { permissao: { findMany } } as unknown as PrismaService;

    const useCase = new ListarPermissoesUseCase(prisma);
    const resultado = await useCase.execute();

    expect(findMany).toHaveBeenCalledWith({ orderBy: { chave: 'asc' } });
    expect(resultado).toEqual([{ id: '1', chave: 'produtos.ler', descricao: 'Ver produtos' }]);
  });
});
