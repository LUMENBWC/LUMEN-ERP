import { Prisma } from '../../../../generated/prisma/client';
import type { TenantScopedPrismaClient } from '../../../infra/prisma/run-in-tenant-context';
import { PAPEL_ADMINISTRADOR } from '../domain/papel-administrador';
import { AuthUserIdJaVinculadoError } from '../domain/usuario.errors';
import type {
  AtualizarUsuarioInput,
  CriarUsuarioInput,
  ListarUsuariosFiltro,
  ListarUsuariosResultado,
  PapelResumo,
  UsuarioDetalhado,
  UsuarioResumo,
  UsuariosRepositoryPort,
} from '../application/ports/usuarios.repository.port';

/** Formato estrutural mínimo que uma query com `include: { papeis: { include: { papel: true } } }` retorna. */
interface UsuarioRowComPapeis {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  filialId: string | null;
  createdAt: Date;
  papeis: { papel: { id: string; nome: string } }[];
}

interface UsuarioRowComDetalhes extends UsuarioRowComPapeis {
  authUserId: string;
  updatedAt: Date;
  criadoPor: { nome: string } | null;
  atualizadoPor: { nome: string } | null;
}

function paraResumo(usuario: UsuarioRowComPapeis): UsuarioResumo {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    ativo: usuario.ativo,
    filialId: usuario.filialId,
    papeis: usuario.papeis.map((up): PapelResumo => ({ id: up.papel.id, nome: up.papel.nome })),
    createdAt: usuario.createdAt,
  };
}

function paraDetalhado(usuario: UsuarioRowComDetalhes): UsuarioDetalhado {
  return {
    ...paraResumo(usuario),
    authUserId: usuario.authUserId,
    updatedAt: usuario.updatedAt,
    criadoPorNome: usuario.criadoPor?.nome ?? null,
    atualizadoPorNome: usuario.atualizadoPor?.nome ?? null,
  };
}

/**
 * Implementa {@link UsuariosRepositoryPort} contra o Prisma. Instanciado por
 * use-case, dentro de um `tx` já escopado por `runInTenantContext`.
 *
 * `empresaId` precisa ser passado explicitamente nos `create`s: a extensão
 * de tenant injeta `empresaId` em runtime (sobrescrevendo o que for
 * passado), mas isso não relaxa o tipo de `data` gerado pelo Prisma - o
 * TypeScript ainda exige o campo. O valor passado aqui é descartado pela
 * extensão de qualquer forma.
 */
export class PrismaUsuariosRepository implements UsuariosRepositoryPort {
  constructor(
    private readonly tx: TenantScopedPrismaClient,
    private readonly empresaId: string,
  ) {}

  async criar(input: CriarUsuarioInput, criadoPorId: string): Promise<UsuarioDetalhado> {
    let usuarioId: string;
    try {
      const usuario = await this.tx.usuario.create({
        data: {
          empresaId: this.empresaId,
          authUserId: input.authUserId,
          nome: input.nome,
          email: input.email,
          filialId: input.filialId,
          createdById: criadoPorId,
          updatedById: criadoPorId,
        },
      });
      usuarioId = usuario.id;
    } catch (error) {
      // authUserId e' @unique globalmente (nao so' por empresa) - a pre-checagem
      // em CriarUsuarioUseCase so' cobre colisao dentro do proprio tenant.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AuthUserIdJaVinculadoError();
      }
      throw error;
    }

    await this.tx.usuarioPapel.create({
      data: { empresaId: this.empresaId, usuarioId, papelId: input.papelId },
    });

    return (await this.obterPorId(usuarioId)) as UsuarioDetalhado;
  }

  async listar(filtro: ListarUsuariosFiltro): Promise<ListarUsuariosResultado> {
    const where: Prisma.UsuarioWhereInput = {
      ...(filtro.ativo !== undefined ? { ativo: filtro.ativo } : {}),
      ...(filtro.papelId ? { papeis: { some: { papelId: filtro.papelId } } } : {}),
      ...(filtro.busca
        ? {
            OR: [
              { nome: { contains: filtro.busca, mode: 'insensitive' as const } },
              { email: { contains: filtro.busca, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.tx.usuario.findMany({
        where,
        include: { papeis: { include: { papel: true } } },
        orderBy: { [filtro.sortBy]: filtro.sortDir },
        skip: (filtro.page - 1) * filtro.perPage,
        take: filtro.perPage,
      }),
      this.tx.usuario.count({ where }),
    ]);

    return { items: items.map(paraResumo), total };
  }

  async obterPorId(id: string): Promise<UsuarioDetalhado | null> {
    const usuario = await this.tx.usuario.findUnique({
      where: { id },
      include: {
        papeis: { include: { papel: true } },
        criadoPor: { select: { nome: true } },
        atualizadoPor: { select: { nome: true } },
      },
    });
    return usuario ? paraDetalhado(usuario) : null;
  }

  async existeAuthUserId(authUserId: string): Promise<boolean> {
    const count = await this.tx.usuario.count({ where: { authUserId } });
    return count > 0;
  }

  async existeEmail(email: string, excluindoId?: string): Promise<boolean> {
    const count = await this.tx.usuario.count({
      where: { email, ...(excluindoId ? { id: { not: excluindoId } } : {}) },
    });
    return count > 0;
  }

  async atualizar(
    id: string,
    input: AtualizarUsuarioInput,
    atualizadoPorId: string,
  ): Promise<UsuarioDetalhado> {
    await this.tx.usuario.update({
      where: { id },
      data: { ...input, updatedById: atualizadoPorId },
    });
    return (await this.obterPorId(id)) as UsuarioDetalhado;
  }

  async definirAtivo(
    id: string,
    ativo: boolean,
    atualizadoPorId: string,
  ): Promise<UsuarioDetalhado> {
    await this.tx.usuario.update({
      where: { id },
      data: { ativo, updatedById: atualizadoPorId },
    });
    return (await this.obterPorId(id)) as UsuarioDetalhado;
  }

  async contarAdministradoresAtivos(excluindoUsuarioId?: string): Promise<number> {
    return this.tx.usuario.count({
      where: {
        ativo: true,
        ...(excluindoUsuarioId ? { id: { not: excluindoUsuarioId } } : {}),
        papeis: { some: { papel: { nome: PAPEL_ADMINISTRADOR } } },
      },
    });
  }

  async obterPapelPorId(papelId: string): Promise<PapelResumo | null> {
    const papel = await this.tx.papel.findUnique({ where: { id: papelId } });
    return papel ? { id: papel.id, nome: papel.nome } : null;
  }

  async usuarioTemPapel(usuarioId: string, papelId: string): Promise<boolean> {
    const count = await this.tx.usuarioPapel.count({ where: { usuarioId, papelId } });
    return count > 0;
  }

  async atribuirPapel(usuarioId: string, papelId: string): Promise<void> {
    await this.tx.usuarioPapel.create({
      data: { empresaId: this.empresaId, usuarioId, papelId },
    });
  }

  async removerPapel(usuarioId: string, papelId: string): Promise<void> {
    await this.tx.usuarioPapel.delete({ where: { usuarioId_papelId: { usuarioId, papelId } } });
  }
}
