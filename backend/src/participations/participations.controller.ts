import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ParticipationsService } from './participations.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('participations')
@UseGuards(SessionAuthGuard, RolesGuard)
export class ParticipationsController {
  constructor(private service: ParticipationsService) {}

  @Get('mine')
  @Roles(Role.STUDENT)
  mine(@Req() req: any) {
    return this.service.mine(req.user.id);
  }

  @Post()
  @Roles(Role.STUDENT)
  register(@Body('activityId', ParseIntPipe) activityId: number, @Req() req: any) {
    return this.service.register(req.user.id, activityId);
  }

  @Delete(':activityId')
  @Roles(Role.STUDENT)
  cancel(@Param('activityId', ParseIntPipe) activityId: number, @Req() req: any) {
    return this.service.cancel(req.user.id, activityId);
  }

  @Get()
  @Roles(Role.STAFF, Role.ADMIN)
  list(@Query('activityId') activityId?: string, @Query('studentId') studentId?: string, @Query('status') status?: string) {
    return this.service.list({
      activityId: activityId ? Number(activityId) : undefined,
      studentId: studentId ? Number(studentId) : undefined,
      status,
    });
  }

  @Patch(':id')
  @Roles(Role.STAFF, Role.ADMIN)
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }
}
