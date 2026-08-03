import { injectEmpresaId } from './inject-empresa-id';

const EMPRESA_ID = '018f2f3a-0000-7000-8000-000000000000';

describe('injectEmpresaId', () => {
  it('adds empresaId to where on findMany', () => {
    const result = injectEmpresaId('findMany', { where: { ativo: true } }, EMPRESA_ID);
    expect(result).toEqual({ where: { ativo: true, empresaId: EMPRESA_ID } });
  });

  it('creates a where clause when args are undefined', () => {
    const result = injectEmpresaId('findMany', undefined, EMPRESA_ID);
    expect(result).toEqual({ where: { empresaId: EMPRESA_ID } });
  });

  it('adds empresaId to data on create', () => {
    const result = injectEmpresaId('create', { data: { nome: 'Produto X' } }, EMPRESA_ID);
    expect(result).toEqual({ data: { nome: 'Produto X', empresaId: EMPRESA_ID } });
  });

  it('adds empresaId to every item on createMany', () => {
    const result = injectEmpresaId(
      'createMany',
      { data: [{ nome: 'A' }, { nome: 'B' }] },
      EMPRESA_ID,
    );
    expect(result).toEqual({
      data: [
        { nome: 'A', empresaId: EMPRESA_ID },
        { nome: 'B', empresaId: EMPRESA_ID },
      ],
    });
  });

  it('scopes where and create on upsert, leaves update untouched', () => {
    const result = injectEmpresaId(
      'upsert',
      {
        where: { id: 'x' },
        create: { nome: 'Nova' },
        update: { nome: 'Atualizada' },
      },
      EMPRESA_ID,
    );
    expect(result).toEqual({
      where: { id: 'x', empresaId: EMPRESA_ID },
      create: { nome: 'Nova', empresaId: EMPRESA_ID },
      update: { nome: 'Atualizada' },
    });
  });

  it('does not let caller-supplied empresaId override the injected one', () => {
    const result = injectEmpresaId(
      'findMany',
      { where: { empresaId: 'outra-empresa' } },
      EMPRESA_ID,
    );
    expect((result.where as { empresaId: string }).empresaId).toBe(EMPRESA_ID);
  });

  it('passes through operations it does not scope, like $queryRaw helpers', () => {
    const result = injectEmpresaId('executeRaw', { sql: 'SELECT 1' }, EMPRESA_ID);
    expect(result).toEqual({ sql: 'SELECT 1' });
  });
});
