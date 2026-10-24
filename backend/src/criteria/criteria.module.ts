import { Module } from '@nestjs/common';
import { CriteriaController } from './criteria.controller';
import { CriteriaService } from './criteria.service';
import { PrismaService } from '../prisma.service';

@Module({ controllers: [CriteriaController], providers: [CriteriaService, PrismaService] })
export class CriteriaModule {}
