import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { DeclarationsService } from './declarations.service';
import { ReviewDeclarationDto } from './dto/review-declaration.dto';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('declarations')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.STAFF, Role.ADMIN)
export class DeclarationsController {
  constructor(private service: DeclarationsService) {}

  @Get() list() {
    return this.service.list();
  }

  @Get(':code') detail(@Param('code') code: string) {
    return this.service.detail(code);
  }

  @Patch(':code')
  review(@Param('code') code: string, @Body() dto: ReviewDeclarationDto, @Req() req: any) {
    return this.service.review(code, dto, req.user.name);
  }
}
