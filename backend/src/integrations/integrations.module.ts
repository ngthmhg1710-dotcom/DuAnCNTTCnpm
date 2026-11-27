import { Module } from '@nestjs/common';
import { IntegrationsController, MockPartnerController, PartnerIngestController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../prisma.service';

@Module({ controllers: [IntegrationsController, MockPartnerController, PartnerIngestController], providers: [IntegrationsService, PrismaService] })
export class IntegrationsModule {}
