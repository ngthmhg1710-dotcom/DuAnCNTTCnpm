import { Module } from '@nestjs/common';
import { DeclarationsController } from './declarations.controller';
import { DeclarationsService } from './declarations.service';
import { PrismaService } from '../prisma.service';

@Module({ controllers: [DeclarationsController], providers: [DeclarationsService, PrismaService] })
export class DeclarationsModule {}
