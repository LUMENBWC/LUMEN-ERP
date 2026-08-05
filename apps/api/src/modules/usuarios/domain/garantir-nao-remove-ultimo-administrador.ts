import { UltimoAdministradorError } from './usuario.errors';

/**
 * Pure business rule: an empresa can never be left without at least one
 * active ADMINISTRADOR usuario, or every user would be locked out of user
 * management. `totalAdministradoresAtivosExcluindoAlvo` must already
 * exclude the usuario/papel being acted on - the repository computes that
 * count, this function only decides.
 */
export function garantirNaoRemoveUltimoAdministrador(
  afetaPapelAdministrador: boolean,
  totalAdministradoresAtivosExcluindoAlvo: number,
): void {
  if (afetaPapelAdministrador && totalAdministradoresAtivosExcluindoAlvo < 1) {
    throw new UltimoAdministradorError();
  }
}
