export abstract class ClienteDomainError extends Error {}

export class ClienteNaoEncontradoError extends ClienteDomainError {
  constructor() {
    super('Cliente não encontrado.');
  }
}

export class DocumentoInvalidoError extends ClienteDomainError {
  constructor() {
    super('CPF ou CNPJ inválido.');
  }
}

export class DocumentoJaCadastradoError extends ClienteDomainError {
  constructor() {
    super('Já existe um cliente com este documento nesta empresa.');
  }
}
