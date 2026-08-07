export abstract class CaixaDomainError extends Error {}

export class CaixaJaAbertoError extends CaixaDomainError {
  constructor() {
    super('Já existe uma sessão de caixa aberta.');
  }
}

export class CaixaNaoAbertoError extends CaixaDomainError {
  constructor() {
    super('Não há uma sessão de caixa aberta.');
  }
}

export class SaldoCaixaInsuficienteError extends CaixaDomainError {
  constructor() {
    super('O valor da sangria é maior que o saldo disponível em caixa.');
  }
}

export class CaixaSessaoNaoEncontradaError extends CaixaDomainError {
  constructor() {
    super('Sessão de caixa não encontrada.');
  }
}
