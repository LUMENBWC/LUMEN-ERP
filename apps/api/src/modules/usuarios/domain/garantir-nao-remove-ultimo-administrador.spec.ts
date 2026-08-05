import { garantirNaoRemoveUltimoAdministrador } from './garantir-nao-remove-ultimo-administrador';
import { UltimoAdministradorError } from './usuario.errors';

describe('garantirNaoRemoveUltimoAdministrador', () => {
  it('não lança quando a ação não afeta o papel ADMINISTRADOR', () => {
    expect(() => garantirNaoRemoveUltimoAdministrador(false, 0)).not.toThrow();
  });

  it('não lança quando ainda restam outros administradores ativos', () => {
    expect(() => garantirNaoRemoveUltimoAdministrador(true, 1)).not.toThrow();
    expect(() => garantirNaoRemoveUltimoAdministrador(true, 5)).not.toThrow();
  });

  it('lança UltimoAdministradorError quando não restaria nenhum outro administrador ativo', () => {
    expect(() => garantirNaoRemoveUltimoAdministrador(true, 0)).toThrow(UltimoAdministradorError);
  });
});
