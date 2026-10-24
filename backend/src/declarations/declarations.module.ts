import { Module } from '@nestjs/common';
import { DeclarationsController } from './declarations.controller';
import { DeclarationsService } from './declarations.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaService } from '../prisma.service';

@Module({ imports: [NotificationsModule], controllers: [DeclarationsController], providers: [DeclarationsService, PrismaService] })
export class DeclarationsModule {}
