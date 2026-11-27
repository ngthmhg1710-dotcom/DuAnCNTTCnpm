import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AlertsService } from './alerts.service';
import { AlertConfigDto } from './alerts.dto';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('alert-settings')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.STAFF, Role.ADMIN)
export class AlertsController {
  constructor(private service: AlertsService) {}
  @Get() get() { return this.service.get(); }
  @Put() set(@Body() dto: AlertConfigDto) { return this.service.set(dto); }
}
