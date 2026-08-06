import path from 'node:path';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

config({ path: path.resolve(__dirname, '../../../.env') });

// Runs as `prisma_migrator` (DIRECT_URL, BYPASSRLS) - never as `app_api`.
// This seeds cross-tenant/global data (the permission catalog) and the
// demo empresa itself, neither of which `app_api` is allowed to write
// per the RLS policies in 20260803005036_roles_rls_auth_fk.
const adapter = new PrismaPg({
  connectionString: requireEnv('DIRECT_URL'),
});
const prisma = new PrismaClient({ adapter });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} não definida - preencha o .env antes de rodar o seed.`,
    );
  }
  return value;
}

const PERMISSOES = [
  { chave: 'produtos.ler', descricao: 'Ver produtos e categorias' },
  { chave: 'produtos.gerenciar', descricao: 'Criar, editar e excluir produtos e categorias' },
  { chave: 'estoque.ler', descricao: 'Ver histórico de movimentações de estoque' },
  {
    chave: 'estoque.ajustar',
    descricao: 'Registrar entradas, ajustes manuais e perdas de estoque',
  },
  {
    chave: 'estoque.ajustarNegativo',
    descricao: 'Registrar ajuste manual ou perda que deixa o estoque do produto negativo',
  },
  { chave: 'clientes.ler', descricao: 'Ver clientes' },
  { chave: 'clientes.gerenciar', descricao: 'Criar, editar e excluir clientes' },
  { chave: 'fornecedores.ler', descricao: 'Ver fornecedores' },
  { chave: 'fornecedores.gerenciar', descricao: 'Criar, editar e excluir fornecedores' },
  { chave: 'orcamentos.ler', descricao: 'Ver orçamentos' },
  { chave: 'orcamentos.gerenciar', descricao: 'Criar, editar e converter orçamentos em venda' },
  { chave: 'vendas.criar', descricao: 'Registrar vendas no PDV' },
  { chave: 'vendas.aplicarDesconto', descricao: 'Aplicar desconto em itens ou no total da venda' },
  { chave: 'vendas.cancelar', descricao: 'Cancelar uma venda' },
  { chave: 'financeiro.ler', descricao: 'Ver contas a receber, a pagar e o dashboard financeiro' },
  { chave: 'financeiro.gerenciar', descricao: 'Registrar recebimentos, pagamentos e despesas' },
  { chave: 'caixa.abrir', descricao: 'Abrir sessão de caixa' },
  { chave: 'caixa.fechar', descricao: 'Fechar sessão de caixa' },
  { chave: 'caixa.movimentar', descricao: 'Registrar sangria e suprimento' },
  { chave: 'usuarios.gerenciar', descricao: 'Criar, editar e desativar usuários da empresa' },
  { chave: 'usuarios.gerenciarPermissoes', descricao: 'Atribuir papéis e permissões a usuários' },
  { chave: 'auditoria.ler', descricao: 'Ver o log de auditoria' },
] as const;

const PAPEIS: Record<string, readonly string[]> = {
  ADMINISTRADOR: PERMISSOES.map((p) => p.chave),
  GERENTE: PERMISSOES.filter((p) => p.chave !== 'usuarios.gerenciarPermissoes').map((p) => p.chave),
  FINANCEIRO: [
    'financeiro.ler',
    'financeiro.gerenciar',
    'clientes.ler',
    'fornecedores.ler',
    'caixa.abrir',
    'caixa.fechar',
  ],
  ESTOQUE: [
    'produtos.ler',
    'produtos.gerenciar',
    'estoque.ler',
    'estoque.ajustar',
    'fornecedores.ler',
  ],
  CAIXA: [
    'caixa.abrir',
    'caixa.fechar',
    'caixa.movimentar',
    'vendas.criar',
    'clientes.ler',
    'produtos.ler',
  ],
  VENDEDOR: [
    'vendas.criar',
    'orcamentos.ler',
    'orcamentos.gerenciar',
    'clientes.ler',
    'clientes.gerenciar',
    'produtos.ler',
  ],
};

const EMPRESA_DEMO_DOCUMENTO = '00000000000191';

async function main(): Promise<void> {
  console.log('Seeding catálogo global de permissões...');
  for (const permissao of PERMISSOES) {
    await prisma.permissao.upsert({
      where: { chave: permissao.chave },
      update: { descricao: permissao.descricao },
      create: permissao,
    });
  }

  console.log('Seeding empresa demo...');
  const empresa = await prisma.empresa.upsert({
    where: { documento: EMPRESA_DEMO_DOCUMENTO },
    update: {},
    create: {
      razaoSocial: 'LUMEN ERP Demo LTDA',
      nomeFantasia: 'LUMEN ERP Demo',
      documento: EMPRESA_DEMO_DOCUMENTO,
      plano: 'trial',
    },
  });

  console.log('Seeding papéis padrão e permissões da empresa demo...');
  const permissoesPorChave = await prisma.permissao.findMany();
  const permissaoIdByChave = new Map(permissoesPorChave.map((p) => [p.chave, p.id]));

  for (const [nomePapel, chaves] of Object.entries(PAPEIS)) {
    const papel = await prisma.papel.upsert({
      where: { empresaId_nome: { empresaId: empresa.id, nome: nomePapel } },
      update: {},
      create: { empresaId: empresa.id, nome: nomePapel },
    });

    for (const chave of chaves) {
      const permissaoId = permissaoIdByChave.get(chave);
      if (!permissaoId) {
        throw new Error(
          `Permissão "${chave}" referenciada pelo papel "${nomePapel}" não existe no catálogo.`,
        );
      }
      await prisma.papelPermissao.upsert({
        where: { papelId_permissaoId: { papelId: papel.id, permissaoId } },
        update: {},
        create: { empresaId: empresa.id, papelId: papel.id, permissaoId },
      });
    }
  }

  const adminAuthUserId = process.env.SEED_ADMIN_AUTH_USER_ID;
  if (!adminAuthUserId) {
    console.log(
      '\nSEED_ADMIN_AUTH_USER_ID não definido - pulando criação do usuário administrador demo.\n' +
        'Crie um usuário no Supabase Auth (dashboard ou Etapa 2), exporte SEED_ADMIN_AUTH_USER_ID=<uuid> e rode o seed novamente.',
    );
  } else {
    console.log('Seeding usuário administrador demo...');
    const adminPapel = await prisma.papel.findUniqueOrThrow({
      where: { empresaId_nome: { empresaId: empresa.id, nome: 'ADMINISTRADOR' } },
    });
    const usuario = await prisma.usuario.upsert({
      where: { authUserId: adminAuthUserId },
      update: {},
      create: {
        empresaId: empresa.id,
        authUserId: adminAuthUserId,
        nome: 'Administrador Demo',
        email: 'admin@lumen-erp-demo.local',
      },
    });
    await prisma.usuarioPapel.upsert({
      where: { usuarioId_papelId: { usuarioId: usuario.id, papelId: adminPapel.id } },
      update: {},
      create: { empresaId: empresa.id, usuarioId: usuario.id, papelId: adminPapel.id },
    });
  }

  console.log('\nSeed concluído.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
