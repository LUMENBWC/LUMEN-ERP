export abstract class FornecedorDomainError extends Error {}

export class FornecedorNaoEncontradoError extends FornecedorDomainError {
  constructor() {
    super('Fornecedor não encontrado.');
  }
}

export class DocumentoInvalidoError extends FornecedorDomainError {
  constructor() {
    super('CPF ou CNPJ inválido.');
  }
}

export class DocumentoJaCadastradoError extends FornecedorDomainError {
  constructor() {
    super('Já existe um fornecedor com este documento nesta empresa.');
  }
}

export class ProdutoInvalidoError extends FornecedorDomainError {
  constructor() {
    super('Produto não encontrado.');
  }
}

export class ProdutoJaVinculadoError extends FornecedorDomainError {
  constructor() {
    super('Este produto já está vinculado a este fornecedor.');
  }
}

export class VinculoNaoEncontradoError extends FornecedorDomainError {
  constructor() {
    super('Este produto não está vinculado a este fornecedor.');
  }
}
