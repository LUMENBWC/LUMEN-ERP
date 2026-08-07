export abstract class VendaDomainError extends Error {}

export class VendaNaoEncontradaError extends VendaDomainError {
  constructor() {
    super('Venda não encontrada.');
  }
}

export class ClienteInvalidoError extends VendaDomainError {
  constructor() {
    super('Cliente não encontrado.');
  }
}

export class ProdutoInvalidoError extends VendaDomainError {
  constructor(produtoId: string) {
    super(`Produto ${produtoId} não encontrado.`);
  }
}

export class EstoqueInsuficienteError extends VendaDomainError {
  constructor(produtoNome: string) {
    super(`Estoque insuficiente de "${produtoNome}" para concluir a venda.`);
  }
}

export class DescontoNaoAutorizadoError extends VendaDomainError {
  constructor() {
    super('Você não tem permissão para aplicar desconto nesta venda.');
  }
}

export class PagamentoDivergenteError extends VendaDomainError {
  constructor() {
    super('A soma dos pagamentos não corresponde ao total da venda.');
  }
}

export class CaixaFechadoError extends VendaDomainError {
  constructor() {
    super('É necessário um caixa aberto para receber pagamentos em dinheiro.');
  }
}

export class VendaJaCanceladaError extends VendaDomainError {
  constructor() {
    super('Esta venda já foi cancelada.');
  }
}
