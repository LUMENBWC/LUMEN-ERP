export abstract class FinanceiroDomainError extends Error {}

export class ContaReceberNaoEncontradaError extends FinanceiroDomainError {
  constructor() {
    super('Conta a receber não encontrada.');
  }
}

export class ContaPagarNaoEncontradaError extends FinanceiroDomainError {
  constructor() {
    super('Conta a pagar não encontrada.');
  }
}

export class CategoriaDespesaNaoEncontradaError extends FinanceiroDomainError {
  constructor() {
    super('Categoria de despesa não encontrada.');
  }
}

export class CategoriaDespesaDuplicadaError extends FinanceiroDomainError {
  constructor() {
    super('Já existe uma categoria de despesa com esse nome.');
  }
}

export class FornecedorInvalidoError extends FinanceiroDomainError {
  constructor() {
    super('Fornecedor não encontrado.');
  }
}

export class ContaJaQuitadaError extends FinanceiroDomainError {
  constructor() {
    super('Esta conta já está paga ou cancelada.');
  }
}

export class ValorLancamentoInvalidoError extends FinanceiroDomainError {
  constructor() {
    super('O valor informado é maior que o saldo em aberto desta conta.');
  }
}

export class ContaPagarNaoCancelavelError extends FinanceiroDomainError {
  constructor() {
    super('Só é possível cancelar uma conta a pagar que ainda não recebeu nenhum pagamento.');
  }
}
