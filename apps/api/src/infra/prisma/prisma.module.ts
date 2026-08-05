import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  PrismaTenantTransactionRunner,
  TENANT_TRANSACTION_RUNNER,
} from './tenant-transaction-runner';

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: TENANT_TRANSACTION_RUNNER, useClass: PrismaTenantTransactionRunner },
  ],
  exports: [PrismaService, TENANT_TRANSACTION_RUNNER],
})
export class PrismaModule {}
