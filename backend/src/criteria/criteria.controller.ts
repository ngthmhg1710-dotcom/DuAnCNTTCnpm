import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CriteriaService } from './criteria.service';
import { CriteriaDto } from './criteria.dto';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('criteria')
@UseGuards(SessionAuthGuard, RolesGuard)
export class CriteriaController {
  constructor(private service: CriteriaService) {}

  @Get('progress') @Roles(Role.STUDENT)
  progress(@Req() req: any) {
    return this.service.progress(req.user.id);
  }

  @Get('progress/:id') @Roles(Role.STUDENT)
  progressDetail(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.service.progressDetail(req.user.id, id);
  }

  @Get() @Roles(Role.STAFF, Role.ADMIN)
  list() {
    return this.service.list();
  }

  @Post() @Roles(Role.STAFF, Role.ADMIN)
  create(@Body() dto: CriteriaDto) {
    return this.service.create(dto);
  }

  @Patch(':id') @Roles(Role.STAFF, Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CriteriaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id') @Roles(Role.STAFF, Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
