import { Module } from '@nestjs/common';
import { SemestersController } from './semesters.controller';
import { SemestersService } from './semesters.service';
import { PrismaService } from '../prisma.service';

@Module({ controllers: [SemestersController], providers: [SemestersService, PrismaService] })
export class SemestersModule {}
