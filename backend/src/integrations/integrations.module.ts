import { Module } from '@nestjs/common';
import { IntegrationsController, MockPartnerController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../prisma.service';

@Module({ controllers: [IntegrationsController, MockPartnerController], providers: [IntegrationsService, PrismaService] })
export class IntegrationsModule {}
