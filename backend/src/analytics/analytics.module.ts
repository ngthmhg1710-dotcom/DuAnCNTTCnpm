import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma.service';
import { AlertsModule } from '../alerts/alerts.module';

@Module({ imports: [AlertsModule], controllers: [AnalyticsController], providers: [AnalyticsService, PrismaService] })
export class AnalyticsModule {}
