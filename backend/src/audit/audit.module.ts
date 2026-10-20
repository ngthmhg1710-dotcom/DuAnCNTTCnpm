import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditController } from './audit.controller';
import { AuditInterceptor } from './audit.interceptor';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AuditController],
  providers: [PrismaService, { provide: APP_INTERCEPTOR, useClass: AuditInterceptor }],
})
export class AuditModule {}
