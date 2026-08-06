export abstract class OrcamentoDomainError extends Error {}

export class OrcamentoNaoEncontradoError extends OrcamentoDomainError {
  constructor() {
    super('Orçamento não encontrado.');
  }
}

export class ClienteInvalidoError extends OrcamentoDomainError {
  constructor() {
    super('Cliente não encontrado.');
  }
}

export class ProdutoInvalidoError extends OrcamentoDomainError {
  constructor(produtoId: string) {
    super(`Produto ${produtoId} não encontrado.`);
  }
}

export class TransicaoStatusInvalidaError extends OrcamentoDomainError {
  constructor(atual: string, novo: string) {
    super(`Não é possível mudar o status de ${atual} para ${novo}.`);
  }
}

export class OrcamentoNaoEditavelError extends OrcamentoDomainError {
  constructor() {
    super('Só é possível editar um orçamento enquanto ele está em rascunho.');
  }
}

export class OrcamentoNaoCancelavelError extends OrcamentoDomainError {
  constructor() {
    super('Só é possível cancelar um orçamento em rascunho ou enviado.');
  }
}
