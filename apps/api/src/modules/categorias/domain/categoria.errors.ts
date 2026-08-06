export abstract class CategoriaDomainError extends Error {}

export class CategoriaNaoEncontradaError extends CategoriaDomainError {
  constructor() {
    super('Categoria não encontrada.');
  }
}

export class NomeCategoriaJaCadastradoError extends CategoriaDomainError {
  constructor() {
    super('Já existe uma categoria com este nome nesta empresa.');
  }
}

export class CategoriaPaiNaoEncontradaError extends CategoriaDomainError {
  constructor() {
    super('Categoria pai não encontrada.');
  }
}

/** Spec Secao 3.1: "hierarquia simples de 1 nivel" - uma subcategoria não pode ter suas próprias subcategorias. */
export class HierarquiaExcedeUmNivelError extends CategoriaDomainError {
  constructor() {
    super(
      'Uma subcategoria não pode ter suas próprias subcategorias (hierarquia limitada a 1 nível).',
    );
  }
}

export class CategoriaNaoPodeSerPaiDeSiMesmaError extends CategoriaDomainError {
  constructor() {
    super('Uma categoria não pode ser subcategoria de si mesma.');
  }
}
