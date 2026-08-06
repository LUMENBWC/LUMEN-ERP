import {
  CategoriaNaoPodeSerPaiDeSiMesmaError,
  HierarquiaExcedeUmNivelError,
} from './categoria.errors';
import { garantirHierarquiaValida } from './garantir-hierarquia-valida';

describe('garantirHierarquiaValida', () => {
  it('não lança quando não há categoria pai (categoria raiz)', () => {
    expect(() =>
      garantirHierarquiaValida({
        categoriaId: null,
        categoriaPaiId: null,
        categoriaPai: null,
        categoriaTemSubcategorias: false,
      }),
    ).not.toThrow();
  });

  it('não lança quando o pai é uma categoria raiz e a filha não tem subcategorias', () => {
    expect(() =>
      garantirHierarquiaValida({
        categoriaId: 'cat-2',
        categoriaPaiId: 'cat-1',
        categoriaPai: { categoriaPaiId: null },
        categoriaTemSubcategorias: false,
      }),
    ).not.toThrow();
  });

  it('lança quando a categoria escolhida como pai já é uma subcategoria', () => {
    expect(() =>
      garantirHierarquiaValida({
        categoriaId: 'cat-3',
        categoriaPaiId: 'cat-2',
        categoriaPai: { categoriaPaiId: 'cat-1' },
        categoriaTemSubcategorias: false,
      }),
    ).toThrow(HierarquiaExcedeUmNivelError);
  });

  it('lança quando a categoria que está virando filha já tem suas próprias subcategorias', () => {
    expect(() =>
      garantirHierarquiaValida({
        categoriaId: 'cat-1',
        categoriaPaiId: 'cat-2',
        categoriaPai: { categoriaPaiId: null },
        categoriaTemSubcategorias: true,
      }),
    ).toThrow(HierarquiaExcedeUmNivelError);
  });

  it('lança quando a categoria pai é ela mesma', () => {
    expect(() =>
      garantirHierarquiaValida({
        categoriaId: 'cat-1',
        categoriaPaiId: 'cat-1',
        categoriaPai: { categoriaPaiId: null },
        categoriaTemSubcategorias: false,
      }),
    ).toThrow(CategoriaNaoPodeSerPaiDeSiMesmaError);
  });
});
