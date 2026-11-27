import { Module } from '@nestjs/common';
import { JobsController, MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma.service';
import { MailModule } from '../mail/mail.module';
import { AlertsModule } from '../alerts/alerts.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({ imports: [MailModule, AlertsModule, AnalyticsModule], controllers: [MessagesController, JobsController], providers: [MessagesService, PrismaService] })
export class MessagesModule {}
