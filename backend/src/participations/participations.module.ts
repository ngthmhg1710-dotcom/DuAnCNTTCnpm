import { Module } from '@nestjs/common';
import { ParticipationsController } from './participations.controller';
import { ParticipationsService } from './participations.service';
import { PrismaService } from '../prisma.service';

@Module({ controllers: [ParticipationsController], providers: [ParticipationsService, PrismaService] })
export class ParticipationsModule {}
