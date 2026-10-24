import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './notifications.dto';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('notifications')
@UseGuards(SessionAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get() mine(@Req() req: any) {
    return this.service.mine(req.user.id);
  }

  @Get('sent') @Roles(Role.STAFF, Role.ADMIN)
  sent(@Req() req: any) {
    return this.service.sent(req.user.id);
  }

  @Post() @Roles(Role.STAFF, Role.ADMIN)
  broadcast(@Body() dto: CreateNotificationDto, @Req() req: any) {
    return this.service.broadcast(dto, req.user.id);
  }

  @Patch('read-all') markAllRead(@Req() req: any) {
    return this.service.markAllRead(req.user.id);
  }

  @Patch(':id/read') markRead(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.service.markRead(req.user.id, id);
  }
}
