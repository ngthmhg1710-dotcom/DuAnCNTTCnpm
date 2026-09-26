import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { DeclarationsService } from './declarations.service';
import { ReviewDeclarationDto } from './dto/review-declaration.dto';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('declarations')
@UseGuards(SessionAuthGuard, RolesGuard)
export class DeclarationsController {
  constructor(private service: DeclarationsService) {}

  @Get()
  @Roles(Role.STUDENT, Role.STAFF, Role.ADMIN)
  list(@Req() req: any) {
    if (req.user.role === Role.STUDENT) {
      return this.service.listForStudent(req.user.id);
    }
    return this.service.list();
  }

  @Get(':code')
  @Roles(Role.STUDENT, Role.STAFF, Role.ADMIN)
  detail(@Param('code') code: string) {
    return this.service.detail(code);
  }

  @Post()
  @Roles(Role.STUDENT, Role.STAFF, Role.ADMIN)
  create(@Body() dto: any, @Req() req: any) {
    return this.service.create(dto, req.user.id);
  }

  @Patch(':code')
  @Roles(Role.STAFF, Role.ADMIN)
  review(@Param('code') code: string, @Body() dto: ReviewDeclarationDto, @Req() req: any) {
    return this.service.review(code, dto, req.user.name);
  }
}
