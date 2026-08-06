export abstract class EstoqueDomainError extends Error {}

export class ProdutoNaoEncontradoError extends EstoqueDomainError {
  constructor() {
    super('Produto não encontrado.');
  }
}

export class EstoqueInsuficienteError extends EstoqueDomainError {
  constructor() {
    super(
      'Estoque insuficiente para esta operação. Apenas usuários com a permissão de deixar o estoque negativo podem prosseguir.',
    );
  }
}
