import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('students')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.STAFF, Role.ADMIN)
export class StudentsController {
  constructor(private service: StudentsService) {}

  @Get() list() {
    return this.service.list();
  }

  @Get(':id') detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }
}
