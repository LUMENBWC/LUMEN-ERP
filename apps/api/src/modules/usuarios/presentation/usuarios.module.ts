import { Module } from '@nestjs/common';
import { AtribuirPapelUseCase } from '../application/use-cases/atribuir-papel.use-case';
import { AtualizarUsuarioUseCase } from '../application/use-cases/atualizar-usuario.use-case';
import { CriarUsuarioUseCase } from '../application/use-cases/criar-usuario.use-case';
import { DefinirAtivoUsuarioUseCase } from '../application/use-cases/definir-ativo-usuario.use-case';
import { ListarUsuariosUseCase } from '../application/use-cases/listar-usuarios.use-case';
import { ObterUsuarioUseCase } from '../application/use-cases/obter-usuario.use-case';
import { USUARIOS_REPOSITORY_FACTORY } from '../application/ports/usuarios-repository.factory';
import { RemoverPapelUseCase } from '../application/use-cases/remover-papel.use-case';
import { PrismaUsuariosRepository } from '../infra/prisma-usuarios.repository';
import { UsuariosController } from './usuarios.controller';

@Module({
  controllers: [UsuariosController],
  providers: [
    CriarUsuarioUseCase,
    ListarUsuariosUseCase,
    ObterUsuarioUseCase,
    AtualizarUsuarioUseCase,
    DefinirAtivoUsuarioUseCase,
    AtribuirPapelUseCase,
    RemoverPapelUseCase,
    {
      provide: USUARIOS_REPOSITORY_FACTORY,
      useValue: (
        tx: ConstructorParameters<typeof PrismaUsuariosRepository>[0],
        empresaId: string,
      ) => new PrismaUsuariosRepository(tx, empresaId),
    },
  ],
})
export class UsuariosModule {}
