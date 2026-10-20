import { Module } from '@nestjs/common';
import { RoleDefsController } from './role-defs.controller';
import { PrismaService } from '../prisma.service';

@Module({ controllers: [RoleDefsController], providers: [PrismaService] })
export class RoleDefsModule {}
