import { randomUUID } from 'node:crypto';
import { prismaDirect } from './prisma-direct';
import { createSupabaseAdminClient } from './supabase-admin';

export interface TenantSeed {
  empresaId: string;
  usuarioId: string;
  authUserId: string;
}

const authUsersCriadosNesteRun: string[] = [];

/**
 * `usuarios.authUserId` tem FK pra `auth.users` (Supabase Auth) - não dá
 * pra inventar um uuid qualquer. Cria sempre um usuário novo no Supabase
 * Auth (sem senha memorável, ninguém faz login com ele - só existe pra
 * satisfazer a FK) e registra pra remoção em `limparAuthUsersDeTeste`.
 */
async function criarAuthUserDeTeste(): Promise<string> {
  const admin = createSupabaseAdminClient();
  const email = `e2e-${randomUUID()}@lumen-erp-test.local`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: randomUUID(),
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(`Falha ao criar usuário de teste no Supabase Auth: ${error?.message}`);
  }
  authUsersCriadosNesteRun.push(data.user.id);
  return data.user.id;
}

/** Chamar no `afterAll` de todo spec que usou `seedTenantAdministrador`/`seedUsuarioSemPermissoes`. */
export async function limparAuthUsersDeTeste(): Promise<void> {
  if (authUsersCriadosNesteRun.length === 0) {
    return;
  }
  const admin = createSupabaseAdminClient();
  const ids = authUsersCriadosNesteRun.splice(0, authUsersCriadosNesteRun.length);
  await Promise.all(ids.map((id) => admin.auth.admin.deleteUser(id).catch(() => undefined)));
}

/**
 * Provisiona (idempotente na parte de empresa/papel) uma empresa de teste
 * com um usuário ADMINISTRADOR (todas as permissões do catálogo). A empresa
 * persiste entre execuções (mesmo comportamento aceito pra empresa demo de
 * `prisma/seed.ts`), mas o usuário é sempre novo, por causa da FK acima -
 * `Usuario`s de execuções antigas ficam órfãos (ativo=true, authUserId
 * apontando pra uma auth.users já removida), inofensivos, mesma categoria
 * de "resíduo" já aceita pra dados de negócio nesses tenants de teste.
 */
export async function seedTenantAdministrador(
  documento: string,
  razaoSocial: string,
): Promise<TenantSeed> {
  const authUserId = await criarAuthUserDeTeste();

  const empresa = await prismaDirect.empresa.upsert({
    where: { documento },
    update: {},
    create: { razaoSocial, nomeFantasia: razaoSocial, documento, plano: 'trial' },
  });

  const permissoes = await prismaDirect.permissao.findMany();
  if (permissoes.length === 0) {
    throw new Error(
      'Catálogo de permissões vazio - rode `pnpm run seed` em apps/api antes dos testes e2e.',
    );
  }

  const papel = await prismaDirect.papel.upsert({
    where: { empresaId_nome: { empresaId: empresa.id, nome: 'ADMINISTRADOR' } },
    update: {},
    create: { empresaId: empresa.id, nome: 'ADMINISTRADOR' },
  });

  for (const permissao of permissoes) {
    await prismaDirect.papelPermissao.upsert({
      where: { papelId_permissaoId: { papelId: papel.id, permissaoId: permissao.id } },
      update: {},
      create: { empresaId: empresa.id, papelId: papel.id, permissaoId: permissao.id },
    });
  }

  const usuario = await prismaDirect.usuario.create({
    data: {
      empresaId: empresa.id,
      authUserId,
      nome: `Admin E2E - ${razaoSocial}`,
      email: `${authUserId}@e2e.lumen-erp.test`,
    },
  });

  await prismaDirect.usuarioPapel.create({
    data: { empresaId: empresa.id, usuarioId: usuario.id, papelId: papel.id },
  });

  return { empresaId: empresa.id, usuarioId: usuario.id, authUserId };
}

/**
 * Só pode existir um `CaixaSessao` ABERTO por empresa por vez (regra de
 * negócio). Como a empresa de teste persiste entre execuções (ver acima),
 * uma execução anterior interrompida antes do `fechar` deixaria a próxima
 * sempre batendo em `CaixaJaAbertoError` - fecha à força qualquer sessão
 * ainda aberta antes de começar, direto via SQL (bypassa a regra de
 * negócio de propósito, é limpeza de teste, não fluxo de produção).
 */
export async function fecharCaixasAbertosDoTenant(empresaId: string): Promise<void> {
  await prismaDirect.caixaSessao.updateMany({
    where: { empresaId, status: 'ABERTO' },
    data: { status: 'FECHADO', fechadoEm: new Date() },
  });
}

/** Usuário ativo sem nenhuma permissão, para testar o PermissionsGuard (403). */
export async function seedUsuarioSemPermissoes(
  empresaId: string,
): Promise<{ usuarioId: string; authUserId: string }> {
  const authUserId = await criarAuthUserDeTeste();

  const papel = await prismaDirect.papel.upsert({
    where: { empresaId_nome: { empresaId, nome: 'SEM_PERMISSOES_E2E' } },
    update: {},
    create: { empresaId, nome: 'SEM_PERMISSOES_E2E' },
  });

  const usuario = await prismaDirect.usuario.create({
    data: {
      empresaId,
      authUserId,
      nome: 'Sem Permissões E2E',
      email: `${authUserId}@e2e.lumen-erp.test`,
    },
  });

  await prismaDirect.usuarioPapel.create({
    data: { empresaId, usuarioId: usuario.id, papelId: papel.id },
  });

  return { usuarioId: usuario.id, authUserId };
}
