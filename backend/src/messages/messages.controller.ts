import { Body, Controller, Get, Headers, HttpCode, Post, Query, ServiceUnavailableException, UnauthorizedException, UseGuards, Req } from '@nestjs/common';
import { Role } from '@prisma/client';
import { timingSafeEqual } from 'crypto';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './messages.dto';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('messages')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.STAFF, Role.ADMIN)
export class MessagesController {
  constructor(private service: MessagesService) {}

  @Get('templates') templates() { return this.service.templates(); }
  @Get('status') status() { return this.service.status(); }

  // ?activityIds=1,2,3
  @Get('audience') audience(@Query('activityIds') ids = '') {
    return this.service.audience(ids.split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 30));
  }

  @Post('send') send(@Body() dto: SendMessageDto, @Req() req: any) {
    return this.service.send(dto, req.user.id);
  }
}

// Gọi định kỳ từ bên ngoài (GitHub Actions) bằng khóa bí mật, vì server miễn phí tự ngủ nên không thể dựa vào bộ hẹn giờ bên trong.
@Controller('jobs')
export class JobsController {
  constructor(private service: MessagesService) {}

  @Post('run') @HttpCode(200)
  run(@Headers('x-cron-secret') secret?: string) {
    const expected = process.env.CRON_SECRET;
    if (!expected) throw new ServiceUnavailableException('Chưa cấu hình CRON_SECRET nên chức năng tự động đang tắt.');
    const a = Buffer.from(secret ?? '');
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new UnauthorizedException('Sai khóa.');
    return this.service.runDue();
  }
}
