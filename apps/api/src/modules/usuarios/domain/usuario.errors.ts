/** Base class for domain-rule violations in the Usuarios module - mapped to HTTP by the controller. */
export abstract class UsuarioDomainError extends Error {}

export class UsuarioNaoEncontradoError extends UsuarioDomainError {
  constructor() {
    super('Usuário não encontrado.');
  }
}

export class PapelNaoEncontradoError extends UsuarioDomainError {
  constructor() {
    super('Papel não encontrado.');
  }
}

export class AuthUserIdJaVinculadoError extends UsuarioDomainError {
  constructor() {
    super('Este authUserId já está vinculado a um usuário desta empresa.');
  }
}

export class EmailJaCadastradoError extends UsuarioDomainError {
  constructor() {
    super('Já existe um usuário com este e-mail nesta empresa.');
  }
}

export class UsuarioJaTemPapelError extends UsuarioDomainError {
  constructor() {
    super('Este usuário já possui este papel.');
  }
}

export class UsuarioNaoTemPapelError extends UsuarioDomainError {
  constructor() {
    super('Este usuário não possui este papel.');
  }
}

/** Thrown when an action would leave the empresa with zero active ADMINISTRADOR usuarios. */
export class UltimoAdministradorError extends UsuarioDomainError {
  constructor() {
    super(
      'Esta ação deixaria a empresa sem nenhum usuário ADMINISTRADOR ativo. Atribua o papel a outro usuário antes de continuar.',
    );
  }
}

export class NaoPodeDesativarASiMesmoError extends UsuarioDomainError {
  constructor() {
    super('Você não pode desativar sua própria conta.');
  }
}
