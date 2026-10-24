import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { SemestersService } from './semesters.service';
import { SemesterDto } from './semesters.dto';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('semesters')
@UseGuards(SessionAuthGuard, RolesGuard)
export class SemestersController {
  constructor(private service: SemestersService) {}

  @Get() list() {
    return this.service.list();
  }

  @Post() @Roles(Role.STAFF, Role.ADMIN)
  create(@Body() dto: SemesterDto) {
    return this.service.create(dto);
  }

  @Patch(':id') @Roles(Role.STAFF, Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: SemesterDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/current') @Roles(Role.STAFF, Role.ADMIN)
  setCurrent(@Param('id', ParseIntPipe) id: number) {
    return this.service.setCurrent(id);
  }

  @Delete(':id') @Roles(Role.STAFF, Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
