export abstract class CaixaDomainError extends Error {}

export class CaixaJaAbertoError extends CaixaDomainError {
  constructor() {
    super('Já existe uma sessão de caixa aberta.');
  }
}
