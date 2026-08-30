import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (e: any) {
      this.logger.warn('PostgreSQL database not connected, running in mock fallback mode.');
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (e: any) {
      // Ignore disconnect error
    }
  }
}
