# Graph Report - . (2026-08-13)

## Corpus Check

- cluster-only mode — file stats not available

## Summary

- 3014 nodes · 8474 edges · 130 communities (117 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `76612c31`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- resolve-tenant-context.ts
- AuditLogService
- dashboard.controller.ts
- produtos.controller.ts
- produtos-list.tsx
- button.tsx
- TenantTransactionRunner
- caixa.controller.ts
- temPermissao
- caixa/application/use-cases/test-helpers.ts
- categorias/application/use-cases/test-helpers.ts
- dashboard-financeiro.tsx
- usuario.errors.ts
- finalizar-venda-dialog.tsx
- categorias.controller.ts
- financeiro.queries.ts
- vendas.controller.ts
- devDependencies
- dependencies
- prisma-financeiro.repository.ts
- financeiro/application/use-cases/test-helpers.ts
- dependencies
- caixa-page.tsx
- cliente-detail.tsx
- app.module.ts
- app/layout.tsx
- orcamentos.queries.ts
- compilerOptions
- prisma-orcamentos.repository.ts
- prisma-vendas.repository.ts
- venda.errors.ts
- app-shell.tsx
- fornecedor-detail.tsx
- ClientesController
- prisma-produtos.repository.ts
- usuarios.queries.ts
- compilerOptions
- TenantContext
- categorias.queries.ts
- conversao-orcamento.e2e-spec.ts
- estoque.controller.ts
- devDependencies
- prisma-fornecedores.repository.ts
- prisma-estoque.repository.ts
- UsuariosController
- cn
- RequirePermissions
- atualizar-cliente.use-case.ts
- OrcamentosController
- orcamento.errors.ts
- listar-papeis.use-case.ts
- finalizar-venda.use-case.ts
- components.json
- devDependencies
- stub-fiscal.provider.ts
- CategoriasController
- prisma-clientes.repository.ts
- movimentacoes-list.tsx
- api/package.json
- .record
- stub-payment-gateway.provider.ts
- supabase-auth.guard.ts
- ObterFornecedorUseCase
- ProdutosController
- CurrentTenant
- CaixaController
- TenantScopedPrismaClient
- clientes.controller.ts
- EstoqueController
- FinanceiroRepositoryPort
- criar-fornecedor.use-case.ts
- orcamentos/application/use-cases/test-helpers.ts
- compilerOptions
- stub-messaging.provider.ts
- estoque.errors.ts
- fornecedores.controller.ts
- package.json
- scripts
- StubFiscalProvider
- registrar-entrada.use-case.ts
- VendasController
- fornecedores/application/use-cases/test-helpers.ts
- devDependencies
- HealthController
- estoque/application/use-cases/test-helpers.ts
- finalizar-venda.use-case.spec.ts
- dashboard.api.ts
- exports
- base.js
- main.ts
- ObterClienteUseCase
- scripts
- clientes/application/use-cases/test-helpers.ts
- PrismaFinanceiroRepository
- calcular-status-conta.ts
- FornecedoresRepositoryPort
- OrcamentosRepositoryPort
- tenant.extension.ts
- .listar
- MeController
- gerar-pdf-orcamento-buffer.ts
- seed.ts
- auth.module.ts
- ClientesRepositoryPort
- validarDocumento
- VendasRepositoryPort
- auth
- nest-cli.json
- CriarClienteUseCase
- calcular-totais-orcamento.ts
- fiscal-provider.module.ts
- shipping-provider.module.ts
- agrupar-clientes-inadimplentes.ts
- web/eslint.config.mjs
- deploy-production.sh
- criar-orcamento.dto.ts
- dotenv
- @types/node
- FinanceiroDomainErrorFilter
- page.test.tsx
- useDefinirAtivo
- prisma.config.ts
- postcss.config.mjs
- .mcp.json
- quick-start-deploy.sh

## God Nodes (most connected - your core abstractions)

1. `TenantContext` - 233 edges
2. `TenantTransactionRunner` - 149 edges
3. `AuditLogService` - 88 edges
4. `CurrentTenant` - 82 edges
5. `RequirePermissions()` - 81 edges
6. `TENANT_TRANSACTION_RUNNER` - 69 edges
7. `cn()` - 63 edges
8. `temPermissao()` - 62 edges
9. `Button()` - 44 edges
10. `TenantScopedPrismaClient` - 43 edges

## Surprising Connections (you probably didn't know these)

- `toWebRequest()` --indirect_call--> `item()` [INFERRED]
  apps/api/src/common/auth/to-web-request.ts → apps/api/src/modules/vendas/domain/calcular-totais-venda.spec.ts
- `CardBody()` --calls--> `cn()` [EXTRACTED]
  apps/web/src/components/ui/card.tsx → apps/web/src/lib/utils.ts
- `lookupUsuarioByAuthUserId()` --calls--> `withPooledClient()` [EXTRACTED]
  apps/api/src/common/tenant/resolve-tenant-context.ts → apps/api/src/infra/prisma/with-pooled-client.ts
- `lookupPapeisEPermissoes()` --calls--> `withPooledClient()` [EXTRACTED]
  apps/api/src/common/tenant/resolve-tenant-context.ts → apps/api/src/infra/prisma/with-pooled-client.ts
- `scopeClient()` --references--> `PrismaService` [EXTRACTED]
  apps/api/src/infra/prisma/run-in-tenant-context.ts → apps/api/src/infra/prisma/prisma.service.ts

## Import Cycles

- None detected.

## Communities (130 total, 13 thin omitted)

### Community 0 - "resolve-tenant-context.ts"

Cohesion: 0.05
Nodes (58): ADR-0002, ADR-0003, ADR-0005, PrismaTenantTransactionRunner, TENANT_TRANSACTION_RUNNER, ADR-0004, Injectable, CriarCategoriaDespesaDto (+50 more)

### Community 1 - "AuditLogService"

Cohesion: 0.05
Nodes (49): AuditLogEntry, AuditLogService, Injectable, AtribuirPapelDto, atribuirPapelSchema, atualizarUsuarioSchema, DefinirAtivoDto, definirAtivoSchema (+41 more)

### Community 2 - "dashboard.controller.ts"

Cohesion: 0.05
Nodes (42): PeriodoQueryDto, periodoQuerySchema, ProdutosMaisVendidosQueryDto, produtosMaisVendidosQuerySchema, DASHBOARD_REPOSITORY_FACTORY, DashboardRepositoryFactory, AgingResumo, DashboardRepositoryPort (+34 more)

### Community 3 - "produtos.controller.ts"

Cohesion: 0.06
Nodes (47): atualizarProdutoSchema, DefinirAtivoProdutoDto, definirAtivoProdutoSchema, CriarProdutoDto, criarProdutoSchema, UNIDADES_MEDIDA, booleanQueryParam, ListarProdutosQueryDto (+39 more)

### Community 4 - "produtos-list.tsx"

Cohesion: 0.12
Nodes (49): PageHeader(), ErrorState(), LoadingState(), Badge(), badgeVariants, buttonVariants, Switch(), Table() (+41 more)

### Community 5 - "button.tsx"

Cohesion: 0.11
Nodes (51): Button(), Dialog(), DialogContent(), DialogFooter(), DialogHeader(), DialogTitle(), DialogTrigger(), Input() (+43 more)

### Community 6 - "TenantTransactionRunner"

Cohesion: 0.06
Nodes (39): TenantTransactionRunner, Inject, Inject, Inject, Inject, Inject, AtualizarStatusOrcamentoDto, atualizarStatusOrcamentoSchema (+31 more)

### Community 7 - "caixa.controller.ts"

Cohesion: 0.06
Nodes (40): AbrirCaixaDto, abrirCaixaSchema, FecharCaixaDto, fecharCaixaSchema, ListarSessoesQueryDto, listarSessoesQuerySchema, SangriaDto, sangriaSchema (+32 more)

### Community 8 - "temPermissao"

Cohesion: 0.09
Nodes (32): CaixaRoutePage(), SessaoCaixaDetailPage(), SessoesCaixaPage(), CategoriasPage(), ClienteDetailPage(), NovoClientePage(), ClientesPage(), EstoquePage() (+24 more)

### Community 9 - "caixa/application/use-cases/test-helpers.ts"

Cohesion: 0.08
Nodes (28): AbrirCaixaInput, CaixaRepositoryPort, CaixaSessaoDetalhada, CaixaSessaoResumo, FecharCaixaInput, ListarSessoesFiltro, ListarSessoesResultado, MovimentoCaixaResumo (+20 more)

### Community 10 - "categorias/application/use-cases/test-helpers.ts"

Cohesion: 0.07
Nodes (25): AtualizarCategoriaInput, CategoriaResumo, CategoriasRepositoryPort, CriarCategoriaInput, ListarCategoriasFiltro, ListarCategoriasResultado, dto, categoriaFixture() (+17 more)

### Community 11 - "dashboard-financeiro.tsx"

Cohesion: 0.07
Nodes (36): LoginForm, loginSchema, Me, Card(), CardBody(), CardKicker(), CardTitle(), CardValue() (+28 more)

### Community 12 - "usuario.errors.ts"

Cohesion: 0.09
Nodes (19): UsuariosRepositoryPort, dto, createFakeTxRunner(), createMockAuditLog(), createMockRepo(), TENANT_FIXTURE, usuarioFixture(), AuthUserIdJaVinculadoError (+11 more)

### Community 13 - "finalizar-venda-dialog.tsx"

Cohesion: 0.07
Nodes (41): useClientes(), ConverterOrcamentoDialog(), CarrinhoTabela(), FinalizarVendaDialog(), FORMAS, FORMAS_PARCELADAS, formSchema, FormValues (+33 more)

### Community 14 - "categorias.controller.ts"

Cohesion: 0.11
Nodes (24): AtualizarCategoriaDto, atualizarCategoriaSchema, DefinirAtivoCategoriaDto, definirAtivoCategoriaSchema, criarCategoriaSchema, booleanQueryParam, listarCategoriasQuerySchema, CATEGORIAS_REPOSITORY_FACTORY (+16 more)

### Community 15 - "financeiro.queries.ts"

Cohesion: 0.08
Nodes (36): financeiroApi, financeiroKeys, useCancelarContaPagar(), useCategoriasDespesa(), useContaPagar(), useContaReceber(), useCriarCategoriaDespesa(), useCriarContaPagar() (+28 more)

### Community 16 - "vendas.controller.ts"

Cohesion: 0.09
Nodes (24): bodyMetadata, customMetadata, schema, ADR-0004, ZodValidationPipe, CaixaModule, Module, OrcamentosModule (+16 more)

### Community 17 - "devDependencies"

Cohesion: 0.05
Nodes (39): devDependencies, cross-env, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, prettier, prisma (+31 more)

### Community 18 - "dependencies"

Cohesion: 0.05
Nodes (38): dependencies, class-transformer, class-validator, helmet, @nestjs/common, @nestjs/config, @nestjs/core, @nestjs/platform-express (+30 more)

### Community 19 - "prisma-financeiro.repository.ts"

Cohesion: 0.11
Nodes (29): ContaPagarDetalhada, ContaPagarResumo, ContaReceberDetalhada, ContaReceberResumo, CriarContaPagarInput, FormaPagamentoValue, ListarClientesInadimplentesFiltro, ListarClientesInadimplentesResultado (+21 more)

### Community 20 - "financeiro/application/use-cases/test-helpers.ts"

Cohesion: 0.15
Nodes (17): categoriaDespesaFixture(), contaPagarDetalhadaFixture(), contaParaLancamentoFixture(), createFakeTxRunner(), createMockAuditLog(), createMockRepo(), TENANT_FIXTURE, CategoriaDespesaDuplicadaError (+9 more)

### Community 21 - "dependencies"

Cohesion: 0.06
Nodes (35): dependencies, @base-ui/react, class-variance-authority, clsx, @hookform/resolvers, lucide-react, next, react (+27 more)

### Community 22 - "caixa-page.tsx"

Cohesion: 0.11
Nodes (27): caixaApi, caixaKeys, useAbrirCaixa(), useCaixaAtual(), useFecharCaixa(), useRegistrarSangria(), useRegistrarSuprimento(), useSessaoCaixa() (+19 more)

### Community 23 - "cliente-detail.tsx"

Cohesion: 0.12
Nodes (24): clientesApi, clientesKeys, useAtualizarCliente(), useCliente(), useCriarCliente(), useDefinirAtivoCliente(), ClienteDetalhado, ClienteResumo (+16 more)

### Community 24 - "app.module.ts"

Cohesion: 0.06
Nodes (30): AppModule, Module, AuditModule, Global, Module, RateLimitModule, Module, PrismaModule (+22 more)

### Community 25 - "app/layout.tsx"

Cohesion: 0.07
Nodes (27): nextConfig, barlow, barlowCondensed, geistMono, metadata, Providers(), ^build, .next/** (+19 more)

### Community 26 - "orcamentos.queries.ts"

Cohesion: 0.11
Nodes (25): orcamentosApi, orcamentosKeys, useAtualizarOrcamento(), useAtualizarStatusOrcamento(), useCancelarOrcamento(), useCriarOrcamento(), useGerarPdfOrcamento(), useOrcamento() (+17 more)

### Community 27 - "compilerOptions"

Cohesion: 0.06
Nodes (28): exclude, extends, dist, compilerOptions, allowSyntheticDefaultImports, module, moduleResolution, outDir (+20 more)

### Community 28 - "prisma-orcamentos.repository.ts"

Cohesion: 0.14
Nodes (17): DadosPdfOrcamento, ItemOrcamentoParaSalvar, ListarOrcamentosFiltro, ListarOrcamentosResultado, OrcamentoDetalhado, OrcamentoItemResumo, OrcamentoResumo, SalvarOrcamentoInput (+9 more)

### Community 29 - "prisma-vendas.repository.ts"

Cohesion: 0.12
Nodes (21): FormaPagamentoValue, ItemVendaParaSalvar, ListarVendasFiltro, ListarVendasResultado, ProdutoParaVenda, SalvarVendaInput, StatusContaValue, StatusVendaValue (+13 more)

### Community 30 - "venda.errors.ts"

Cohesion: 0.11
Nodes (15): garantirPagamentosValidos(), CaixaFechadoError, ClienteInvalidoError, DescontoNaoAutorizadoError, EstoqueInsuficienteError, OrcamentoInvalidoError, OrcamentoNaoConversivelError, PagamentoDivergenteError (+7 more)

### Community 31 - "app-shell.tsx"

Cohesion: 0.13
Nodes (20): DashboardPage(), DashboardLayout(), Me, LogoutButton(), Home(), AppShell(), initials(), isActive() (+12 more)

### Community 32 - "fornecedor-detail.tsx"

Cohesion: 0.13
Nodes (22): fornecedoresApi, fornecedoresKeys, useAtualizarFornecedor(), useCriarFornecedor(), useDefinirAtivoFornecedor(), useDesvincularProduto(), useFornecedor(), useVincularProduto() (+14 more)

### Community 33 - "ClientesController"

Cohesion: 0.09
Nodes (18): AtualizarClienteDto, AtualizarClienteUseCase, Inject, Injectable, DefinirAtivoClienteUseCase, Inject, Injectable, ClientesController (+10 more)

### Community 34 - "prisma-produtos.repository.ts"

Cohesion: 0.09
Nodes (10): CriarProdutoInput, ListarProdutosFiltro, ProdutosRepositoryPort, UnidadeMedidaValue, INCLUDE_DETALHADO, paraDetalhado(), paraResumo(), PrismaProdutosRepository (+2 more)

### Community 35 - "usuarios.queries.ts"

Cohesion: 0.10
Nodes (23): papeisApi, usuariosApi, papeisKeys, useAtribuirPapel(), useAtualizarUsuario(), useRemoverPapel(), useUsuario(), usuariosKeys (+15 more)

### Community 36 - "compilerOptions"

Cohesion: 0.07
Nodes (27): compilerOptions, declaration, emitDecoratorMetadata, experimentalDecorators, incremental, module, moduleResolution, noUncheckedIndexedAccess (+19 more)

### Community 37 - "TenantContext"

Cohesion: 0.08
Nodes (6): RequestWithTenant, PERMISSIONS_KEY, RequestWithTenant, TenantContext, CategoriaDespesaResumo, TENANT

### Community 38 - "categorias.queries.ts"

Cohesion: 0.10
Nodes (21): categoriasApi, categoriasKeys, useAtualizarCategoria(), useCategorias(), useCriarCategoria(), useDefinirAtivoCategoria(), CategoriaResumo, ListarCategoriasParams (+13 more)

### Community 39 - "conversao-orcamento.e2e-spec.ts"

Cohesion: 0.18
Nodes (15): TEST_AUTH_HEADER, API_PREFIX, createTestApp(), prismaDirect, authUsersCriadosNesteRun, criarAuthUserDeTeste(), fecharCaixasAbertosDoTenant(), limparAuthUsersDeTeste() (+7 more)

### Community 40 - "estoque.controller.ts"

Cohesion: 0.17
Nodes (14): listarMovimentacoesQuerySchema, registrarAjusteSchema, RegistrarPerdaDto, registrarPerdaSchema, ESTOQUE_REPOSITORY_FACTORY, EstoqueRepositoryFactory, ListarMovimentacoesUseCase, Inject (+6 more)

### Community 41 - "devDependencies"

Cohesion: 0.08
Nodes (26): @erp/config, @erp/config, devDependencies, @erp/config, eslint-config-next, @eslint/eslintrc, jsdom, rimraf (+18 more)

### Community 42 - "prisma-fornecedores.repository.ts"

Cohesion: 0.15
Nodes (14): AtualizarFornecedorInput, CriarFornecedorInput, FornecedorDetalhado, FornecedorResumo, ListarFornecedoresFiltro, ListarFornecedoresResultado, ProdutoVinculado, TipoPessoaValue (+6 more)

### Community 43 - "prisma-estoque.repository.ts"

Cohesion: 0.14
Nodes (13): EstoqueRepositoryPort, ListarMovimentacoesFiltro, ListarMovimentacoesResultado, MovimentacaoResumo, ProdutoParaMovimentacao, RegistrarDeltaInput, RegistrarEntradaInput, TipoMovimentacaoValue (+5 more)

### Community 44 - "UsuariosController"

Cohesion: 0.13
Nodes (15): AtualizarUsuarioDto, CriarUsuarioDto, ApiTags, Body, Controller, Delete, Get, HttpCode (+7 more)

### Community 45 - "cn"

Cohesion: 0.11
Nodes (21): EmptyState(), Skeleton(), DialogDescription(), DialogOverlay(), Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink() (+13 more)

### Community 46 - "RequirePermissions"

Cohesion: 0.22
Nodes (12): RequirePermissions(), FinanceiroController, ApiTags, Body, Controller, Get, HttpCode, Param (+4 more)

### Community 47 - "atualizar-cliente.use-case.ts"

Cohesion: 0.23
Nodes (9): CLIENTES_REPOSITORY_FACTORY, ClientesRepositoryFactory, ClienteDomainError, ClienteNaoEncontradoError, DocumentoInvalidoError, DocumentoJaCadastradoError, ClienteDomainErrorFilter, NOT_FOUND_ERRORS (+1 more)

### Community 48 - "OrcamentosController"

Cohesion: 0.15
Nodes (14): CriarOrcamentoDto, validarClienteEProdutos(), OrcamentosController, ApiTags, Body, Controller, Get, HttpCode (+6 more)

### Community 49 - "orcamento.errors.ts"

Cohesion: 0.16
Nodes (11): garantirTransicaoStatusValida(), TRANSICOES_VALIDAS, ClienteInvalidoError, OrcamentoDomainError, OrcamentoNaoCancelavelError, OrcamentoNaoEditavelError, ProdutoInvalidoError, TransicaoStatusInvalidaError (+3 more)

### Community 50 - "listar-papeis.use-case.ts"

Cohesion: 0.12
Nodes (16): PAPEIS_REPOSITORY_FACTORY, PapeisRepositoryFactory, PapeisRepositoryPort, PapelComPermissoes, PermissaoResumo, ListarPapeisUseCase, Inject, Injectable (+8 more)

### Community 51 - "finalizar-venda.use-case.ts"

Cohesion: 0.13
Nodes (15): FinalizarVendaDto, finalizarVendaSchema, itemVendaSchema, pagamentoVendaSchema, ContaReceberParaSalvar, PagamentoParaSalvar, FORMAS_A_VISTA, FORMAS_PARCELADAS (+7 more)

### Community 52 - "components.json"

Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 53 - "devDependencies"

Cohesion: 0.10
Nodes (21): eslint, typescript-eslint, eslint, typescript-eslint, eslint, eslint-config-prettier, eslint-config-prettier, @eslint/js (+13 more)

### Community 54 - "stub-fiscal.provider.ts"

Cohesion: 0.17
Nodes (9): CalcularFreteInput, DimensoesPacote, EventoRastreio, OpcaoFrete, RastreioEncomenda, ShippingProvider, StubShippingProvider, Injectable (+1 more)

### Community 55 - "CategoriasController"

Cohesion: 0.14
Nodes (13): CriarCategoriaDto, ListarCategoriasQueryDto, CategoriasController, ApiTags, Body, Controller, Get, Param (+5 more)

### Community 56 - "prisma-clientes.repository.ts"

Cohesion: 0.20
Nodes (13): AtualizarClienteInput, ClienteDetalhado, ClienteResumo, CriarClienteInput, ListarClientesFiltro, ListarClientesResultado, TipoPessoaValue, ClienteRow (+5 more)

### Community 57 - "movimentacoes-list.tsx"

Cohesion: 0.14
Nodes (16): estoqueApi, useMovimentacoes(), ListarMovimentacoesParams, ListarMovimentacoesResultado, MovimentacaoResumo, TipoMovimentacao, AjusteDialog(), EntradaDialog() (+8 more)

### Community 58 - "api/package.json"

Cohesion: 0.10
Nodes (19): author, description, jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment (+11 more)

### Community 59 - ".record"

Cohesion: 0.25
Nodes (3): Inject, Injectable, VincularProdutoUseCase

### Community 60 - "stub-payment-gateway.provider.ts"

Cohesion: 0.15
Nodes (10): PaymentGatewayProviderModule, Module, CobrancaCriada, CriarCobrancaInput, FormaCobranca, PaymentGatewayProvider, StatusCobranca, PAYMENT_GATEWAY_PROVIDER (+2 more)

### Community 61 - "supabase-auth.guard.ts"

Cohesion: 0.10
Nodes (15): RequestWithTenant, mockedResolveTenantContext, mockedVerifyAuth, tenant, SupabaseAuthGuard, Injectable, toWebRequest(), lookupPapeisEPermissoes() (+7 more)

### Community 62 - "ObterFornecedorUseCase"

Cohesion: 0.40
Nodes (3): ObterFornecedorUseCase, Inject, Injectable

### Community 63 - "ProdutosController"

Cohesion: 0.16
Nodes (12): AtualizarProdutoDto, ProdutosController, ApiTags, Body, Controller, Get, Param, Patch (+4 more)

### Community 64 - "CurrentTenant"

Cohesion: 0.20
Nodes (11): CurrentTenant, FornecedoresController, ApiTags, Body, Controller, Delete, HttpCode, Param (+3 more)

### Community 65 - "CaixaController"

Cohesion: 0.20
Nodes (11): CaixaController, ApiTags, Body, Controller, Get, HttpCode, Param, Post (+3 more)

### Community 66 - "TenantScopedPrismaClient"

Cohesion: 0.17
Nodes (8): runInTenantContext(), scopeClient(), ScopedClient, TenantScopedPrismaClient, ADR-0005, withTenantScope(), logger, withPooledClient()

### Community 67 - "clientes.controller.ts"

Cohesion: 0.18
Nodes (10): atualizarClienteSchema, DefinirAtivoClienteDto, definirAtivoClienteSchema, criarClienteSchema, booleanQueryParam, ListarClientesQueryDto, listarClientesQuerySchema, ListarClientesUseCase (+2 more)

### Community 68 - "EstoqueController"

Cohesion: 0.18
Nodes (11): ListarMovimentacoesQueryDto, RegistrarAjusteDto, EstoqueController, ApiTags, Body, Controller, Get, Post (+3 more)

### Community 70 - "criar-fornecedor.use-case.ts"

Cohesion: 0.38
Nodes (4): CriarFornecedorDto, criarFornecedorSchema, CriarFornecedorUseCase, Injectable

### Community 71 - "orcamentos/application/use-cases/test-helpers.ts"

Cohesion: 0.32
Nodes (9): dto, dto, createFakeTxRunner(), createMockAuditLog(), createMockRepo(), dadosPdfFixture(), orcamentoFixture(), TENANT_FIXTURE (+1 more)

### Community 72 - "compilerOptions"

Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, noFallthroughCasesInSwitch (+8 more)

### Community 73 - "stub-messaging.provider.ts"

Cohesion: 0.20
Nodes (9): MessagingProviderModule, Module, EnviarMensagemInput, MensagemEnviada, MessagingProvider, TemplateMensagem, MESSAGING_PROVIDER, StubMessagingProvider (+1 more)

### Community 74 - "estoque.errors.ts"

Cohesion: 0.22
Nodes (8): calcularSaldoAposDelta(), EstoqueDomainError, EstoqueInsuficienteError, FornecedorInvalidoError, ProdutoNaoEncontradoError, EstoqueDomainErrorFilter, NOT_FOUND_ERRORS, Catch

### Community 75 - "fornecedores.controller.ts"

Cohesion: 0.15
Nodes (18): AtualizarFornecedorDto, atualizarFornecedorSchema, DefinirAtivoFornecedorDto, definirAtivoFornecedorSchema, VincularProdutoDto, vincularProdutoSchema, FORNECEDORES_REPOSITORY_FACTORY, FornecedoresRepositoryFactory (+10 more)

### Community 76 - "package.json"

Cohesion: 0.12
Nodes (15): description, engines, node, name, packageManager, private, scripts, build (+7 more)

### Community 77 - "scripts"

Cohesion: 0.13
Nodes (15): scripts, build, clean, dev, format, lint, postinstall, start (+7 more)

### Community 78 - "StubFiscalProvider"

Cohesion: 0.16
Nodes (8): DocumentoFiscalEmitido, EmitirDocumentoFiscalInput, FiscalProvider, ItemDocumentoFiscal, StatusDocumentoFiscal, TipoDocumentoFiscal, StubFiscalProvider, Injectable

### Community 79 - "registrar-entrada.use-case.ts"

Cohesion: 0.21
Nodes (7): RegistrarEntradaDto, registrarEntradaSchema, RegistrarEntradaUseCase, Inject, Injectable, calcularCustoMedioPonderado(), calcularMargemLucro()

### Community 80 - "VendasController"

Cohesion: 0.17
Nodes (11): ApiTags, Body, Controller, Get, HttpCode, Param, Post, Query (+3 more)

### Community 81 - "fornecedores/application/use-cases/test-helpers.ts"

Cohesion: 0.16
Nodes (15): dto, createFakeTxRunner(), createMockAuditLog(), createMockRepo(), fornecedorFixture(), TENANT_FIXTURE, DocumentoInvalidoError, DocumentoJaCadastradoError (+7 more)

### Community 82 - "devDependencies"

Cohesion: 0.15
Nodes (13): typescript, typescript, husky, lint-staged, devDependencies, husky, lint-staged, prettier (+5 more)

### Community 83 - "HealthController"

Cohesion: 0.21
Nodes (8): IS_PUBLIC_KEY, Public(), HealthController, ApiTags, Controller, Get, HealthModule, Module

### Community 84 - "estoque/application/use-cases/test-helpers.ts"

Cohesion: 0.38
Nodes (9): dto, dto, dto, createFakeTxRunner(), createMockAuditLog(), createMockRepo(), movimentacaoFixture(), produtoParaMovimentacaoFixture() (+1 more)

### Community 85 - "finalizar-venda.use-case.spec.ts"

Cohesion: 0.41
Nodes (10): setupUseCase(), baseDto(), dtoConversao(), setupUseCase(), createFakeTxRunner(), createMockAuditLog(), createMockVendasRepo(), produtoParaVendaFixture() (+2 more)

### Community 86 - "dashboard.api.ts"

Cohesion: 0.24
Nodes (9): dashboardApi, dashboardKeys, AgingResumo, FluxoCaixaResultado, Periodo, PeriodoParams, ProdutoMaisVendidoResumo, ProdutosMaisVendidosResultado (+1 more)

### Community 87 - "exports"

Cohesion: 0.15
Nodes (12): exports, ./eslint/base, ./eslint/nest, ./eslint/next, ./prettier, ./typescript/base.json, ./typescript/nestjs.json, ./typescript/nextjs.json (+4 more)

### Community 88 - "base.js"

Cohesion: 0.17
Nodes (8): eslintConfigPrettier, globals, tseslint, base, base, globals, react, reactHooks

### Community 89 - "main.ts"

Cohesion: 0.24
Nodes (7): AllExceptionsFilter, ErrorResponseBody, Catch, getHelmetConfig(), bootstrap(), resolveCorsOrigin(), ADR-0003

### Community 90 - "ObterClienteUseCase"

Cohesion: 0.50
Nodes (3): ObterClienteUseCase, Inject, Injectable

### Community 91 - "scripts"

Cohesion: 0.17
Nodes (11): name, private, scripts, build, clean, dev, lint, start (+3 more)

### Community 92 - "clientes/application/use-cases/test-helpers.ts"

Cohesion: 0.50
Nodes (6): dto, clienteFixture(), createFakeTxRunner(), createMockAuditLog(), createMockRepo(), TENANT_FIXTURE

### Community 94 - "calcular-status-conta.ts"

Cohesion: 0.24
Nodes (5): RegistrarPagamentoInput, RegistrarRecebimentoInput, calcularStatusConta(), StatusContaBase, estaVencida()

### Community 97 - "tenant.extension.ts"

Cohesion: 0.29
Nodes (6): injectEmpresaId(), WHERE_SCOPED_OPERATIONS, ADR-0002, isTenantScopedModel(), TENANT_SCOPED_MODELS, TenantScopedModel

### Community 98 - ".listar"

Cohesion: 0.25
Nodes (6): booleanQueryParam, ListarFornecedoresQueryDto, listarFornecedoresQuerySchema, Get, Query, UsePipes

### Community 99 - "MeController"

Cohesion: 0.25
Nodes (6): MeController, ApiTags, Controller, Get, MeModule, Module

### Community 100 - "gerar-pdf-orcamento-buffer.ts"

Cohesion: 0.36
Nodes (7): COLS, COR, formatarData(), formatarMoeda(), formatarQuantidade(), gerarPdfOrcamentoBuffer(), STATUS_LABEL

### Community 101 - "seed.ts"

Cohesion: 0.29
Nodes (4): adapter, PAPEIS, PERMISSOES, prisma

### Community 102 - "auth.module.ts"

Cohesion: 0.29
Nodes (4): AuthModule, Module, PermissionsGuard, Injectable

### Community 104 - "validarDocumento"

Cohesion: 0.62
Nodes (5): calcularDigitoVerificador(), todosDigitosIguais(), validarCNPJ(), validarCPF(), validarDocumento()

### Community 106 - "auth"

Cohesion: 0.43
Nodes (6): auth(), criarCliente(), criarOrcamentoAprovado(), criarProdutoComEstoque(), digitoVerificador(), gerarCpfValido()

### Community 107 - "nest-cli.json"

Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 108 - "CriarClienteUseCase"

Cohesion: 0.33
Nodes (4): CriarClienteDto, CriarClienteUseCase, Inject, Injectable

### Community 109 - "calcular-totais-orcamento.ts"

Cohesion: 0.47
Nodes (4): calcularTotaisOrcamento(), ItemOrcamentoCalculado, ItemOrcamentoInput, TotaisOrcamento

### Community 110 - "fiscal-provider.module.ts"

Cohesion: 0.50
Nodes (3): FiscalProviderModule, Module, FISCAL_PROVIDER

### Community 111 - "shipping-provider.module.ts"

Cohesion: 0.50
Nodes (3): ShippingProviderModule, Module, SHIPPING_PROVIDER

### Community 113 - "web/eslint.config.mjs"

Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 114 - "deploy-production.sh"

Cohesion: 0.70
Nodes (4): check_mark(), error(), deploy-production.sh script, warning()

### Community 116 - "criar-orcamento.dto.ts"

Cohesion: 0.50
Nodes (3): criarOrcamentoSchema, ItemOrcamentoDto, itemOrcamentoSchema

### Community 117 - "dotenv"

Cohesion: 0.67
Nodes (3): dotenv, dotenv, dotenv

### Community 118 - "@types/node"

Cohesion: 0.67
Nodes (3): @types/node, @types/node, @types/node

### Community 121 - "useDefinirAtivo"

Cohesion: 0.67
Nodes (3): useDefinirAtivo(), AtivoSwitch(), AtivoToggle()

## Knowledge Gaps

- **429 isolated node(s):** `supabase`, `$schema`, `collection`, `sourceRoot`, `deleteOutDir` (+424 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `TenantContext` connect `TenantContext` to `resolve-tenant-context.ts`, `AuditLogService`, `dashboard.controller.ts`, `produtos.controller.ts`, `TenantTransactionRunner`, `caixa.controller.ts`, `caixa/application/use-cases/test-helpers.ts`, `categorias/application/use-cases/test-helpers.ts`, `usuario.errors.ts`, `categorias.controller.ts`, `vendas.controller.ts`, `financeiro/application/use-cases/test-helpers.ts`, `ClientesController`, `estoque.controller.ts`, `UsuariosController`, `RequirePermissions`, `atualizar-cliente.use-case.ts`, `OrcamentosController`, `listar-papeis.use-case.ts`, `finalizar-venda.use-case.ts`, `CategoriasController`, `.record`, `supabase-auth.guard.ts`, `ObterFornecedorUseCase`, `ProdutosController`, `CurrentTenant`, `CaixaController`, `clientes.controller.ts`, `EstoqueController`, `criar-fornecedor.use-case.ts`, `orcamentos/application/use-cases/test-helpers.ts`, `fornecedores.controller.ts`, `registrar-entrada.use-case.ts`, `VendasController`, `fornecedores/application/use-cases/test-helpers.ts`, `estoque/application/use-cases/test-helpers.ts`, `finalizar-venda.use-case.spec.ts`, `clientes/application/use-cases/test-helpers.ts`, `.listar`, `MeController`, `CriarClienteUseCase`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `TenantTransactionRunner` connect `TenantTransactionRunner` to `resolve-tenant-context.ts`, `AuditLogService`, `dashboard.controller.ts`, `produtos.controller.ts`, `caixa.controller.ts`, `caixa/application/use-cases/test-helpers.ts`, `categorias/application/use-cases/test-helpers.ts`, `usuario.errors.ts`, `categorias.controller.ts`, `vendas.controller.ts`, `financeiro/application/use-cases/test-helpers.ts`, `ClientesController`, `TenantContext`, `estoque.controller.ts`, `atualizar-cliente.use-case.ts`, `listar-papeis.use-case.ts`, `finalizar-venda.use-case.ts`, `.record`, `ObterFornecedorUseCase`, `TenantScopedPrismaClient`, `clientes.controller.ts`, `criar-fornecedor.use-case.ts`, `orcamentos/application/use-cases/test-helpers.ts`, `fornecedores.controller.ts`, `registrar-entrada.use-case.ts`, `fornecedores/application/use-cases/test-helpers.ts`, `estoque/application/use-cases/test-helpers.ts`, `finalizar-venda.use-case.spec.ts`, `ObterClienteUseCase`, `clientes/application/use-cases/test-helpers.ts`, `CriarClienteUseCase`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `TenantScopedPrismaClient` connect `TenantScopedPrismaClient` to `resolve-tenant-context.ts`, `AuditLogService`, `dashboard.controller.ts`, `produtos.controller.ts`, `TenantTransactionRunner`, `caixa.controller.ts`, `caixa/application/use-cases/test-helpers.ts`, `categorias/application/use-cases/test-helpers.ts`, `categorias.controller.ts`, `vendas.controller.ts`, `prisma-financeiro.repository.ts`, `prisma-orcamentos.repository.ts`, `prisma-vendas.repository.ts`, `prisma-produtos.repository.ts`, `estoque.controller.ts`, `prisma-fornecedores.repository.ts`, `prisma-estoque.repository.ts`, `atualizar-cliente.use-case.ts`, `listar-papeis.use-case.ts`, `prisma-clientes.repository.ts`, `.record`, `fornecedores.controller.ts`, `PrismaFinanceiroRepository`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `supabase`, `$schema`, `collection` to the rest of the system?**
  _429 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `resolve-tenant-context.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.051515151515151514 - nodes in this community are weakly interconnected._
- **Should `AuditLogService` be split into smaller, more focused modules?**
  _Cohesion score 0.05216197666437886 - nodes in this community are weakly interconnected._
- **Should `dashboard.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05350140056022409 - nodes in this community are weakly interconnected._
