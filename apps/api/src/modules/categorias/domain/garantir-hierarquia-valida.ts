import {
  CategoriaNaoPodeSerPaiDeSiMesmaError,
  HierarquiaExcedeUmNivelError,
} from './categoria.errors';

/**
 * Regra pura (spec Secao 3.1): categorias só podem ter 1 nível de
 * profundidade. Duas violações possíveis ao atribuir `categoriaPaiId`:
 * 1. o pai escolhido já é, ele mesmo, uma subcategoria (criaria 2 níveis);
 * 2. a categoria que está virando filha já tem suas próprias subcategorias
 *    (o "neto" ficaria em 2 níveis a partir do novo avô).
 *
 * `categoriaPai` é `null` quando a categoria escolhida como pai não existe
 * (validado separadamente pelo use-case, via {@link CategoriaPaiNaoEncontradaError}).
 */
export function garantirHierarquiaValida(params: {
  categoriaId: string | null;
  categoriaPaiId: string | null;
  categoriaPai: { categoriaPaiId: string | null } | null;
  categoriaTemSubcategorias: boolean;
}): void {
  const { categoriaId, categoriaPaiId, categoriaPai, categoriaTemSubcategorias } = params;
  if (!categoriaPaiId || !categoriaPai) {
    return;
  }

  if (categoriaId && categoriaPaiId === categoriaId) {
    throw new CategoriaNaoPodeSerPaiDeSiMesmaError();
  }
  if (categoriaPai.categoriaPaiId) {
    throw new HierarquiaExcedeUmNivelError();
  }
  if (categoriaTemSubcategorias) {
    throw new HierarquiaExcedeUmNivelError();
  }
}
