import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma.service';
import { AlertsModule } from '../alerts/alerts.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';

@Module({ imports: [AlertsModule, NotificationsModule, MailModule], controllers: [AnalyticsController], providers: [AnalyticsService, PrismaService], exports: [AnalyticsService] })
export class AnalyticsModule {}
