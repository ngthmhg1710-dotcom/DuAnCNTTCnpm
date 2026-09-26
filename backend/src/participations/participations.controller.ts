import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ParticipationsService } from './participations.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('participations')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.STAFF, Role.ADMIN)
export class ParticipationsController {
  constructor(private service: ParticipationsService) {}

  @Get()
  list(@Query('activityId') activityId?: string, @Query('studentId') studentId?: string, @Query('status') status?: string) {
    return this.service.list({
      activityId: activityId ? Number(activityId) : undefined,
      studentId: studentId ? Number(studentId) : undefined,
      status,
    });
  }

  @Patch(':id')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }
}
