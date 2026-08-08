import path from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditModule } from './common/audit/audit.module';
import { AuthModule } from './common/auth/auth.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { CaixaModule } from './modules/caixa/presentation/caixa.module';
import { CategoriasModule } from './modules/categorias/presentation/categorias.module';
import { ClientesModule } from './modules/clientes/presentation/clientes.module';
import { EstoqueModule } from './modules/estoque/presentation/estoque.module';
import { FinanceiroModule } from './modules/financeiro/presentation/financeiro.module';
import { FornecedoresModule } from './modules/fornecedores/presentation/fornecedores.module';
import { HealthModule } from './modules/health/health.module';
import { MeModule } from './modules/me/me.module';
import { OrcamentosModule } from './modules/orcamentos/presentation/orcamentos.module';
import { PapeisModule } from './modules/papeis/presentation/papeis.module';
import { ProdutosModule } from './modules/produtos/presentation/produtos.module';
import { UsuariosModule } from './modules/usuarios/presentation/usuarios.module';
import { VendasModule } from './modules/vendas/presentation/vendas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '../../.env'),
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    HealthModule,
    MeModule,
    UsuariosModule,
    PapeisModule,
    CategoriasModule,
    ProdutosModule,
    EstoqueModule,
    ClientesModule,
    FornecedoresModule,
    OrcamentosModule,
    CaixaModule,
    VendasModule,
    FinanceiroModule,
  ],
})
export class AppModule {}
