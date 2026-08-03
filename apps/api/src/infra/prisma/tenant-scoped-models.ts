/**
 * Every Prisma model whose rows carry an `empresaId` column and are
 * protected by the `tenant_isolation` RLS policy (see prisma/migrations/
 * 20260803005036_roles_rls_auth_fk). `Empresa` is the tenant root (scoped by
 * `id`, not `empresaId`) and `Permissao` is a global catalog - both are
 * intentionally excluded.
 */
export const TENANT_SCOPED_MODELS = [
  'Filial',
  'Usuario',
  'Papel',
  'PapelPermissao',
  'UsuarioPapel',
  'AuditLog',
  'Categoria',
  'Produto',
  'MovimentacaoEstoque',
  'Cliente',
  'Fornecedor',
  'FornecedorProduto',
  'Orcamento',
  'OrcamentoItem',
  'Venda',
  'VendaItem',
  'VendaPagamento',
  'ContaReceber',
  'RecebimentoRecebivel',
  'CategoriaDespesa',
  'ContaPagar',
  'PagamentoPagavel',
  'CaixaSessao',
  'MovimentoCaixa',
] as const;

export type TenantScopedModel = (typeof TENANT_SCOPED_MODELS)[number];

export function isTenantScopedModel(model: string | undefined): model is TenantScopedModel {
  return !!model && (TENANT_SCOPED_MODELS as readonly string[]).includes(model);
}
