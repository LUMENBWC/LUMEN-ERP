export abstract class ProdutoDomainError extends Error {}

export class ProdutoNaoEncontradoError extends ProdutoDomainError {
  constructor() {
    super('Produto não encontrado.');
  }
}

export class SkuJaCadastradoError extends ProdutoDomainError {
  constructor() {
    super('Já existe um produto com este SKU nesta empresa.');
  }
}

export class CodigoBarrasJaCadastradoError extends ProdutoDomainError {
  constructor() {
    super('Já existe um produto com este código de barras nesta empresa.');
  }
}

export class CategoriaInvalidaError extends ProdutoDomainError {
  constructor() {
    super('Categoria não encontrada.');
  }
}
