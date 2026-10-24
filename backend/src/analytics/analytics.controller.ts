import { Controller, Get, ParseIntPipe, Query, Res, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { sendXlsx } from '../common/xlsx';
import { Role } from '@prisma/client';

@Controller('analytics')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.STAFF, Role.ADMIN)
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}
  @Get('overview') overview() { return this.service.overview(); }
  @Get('dashboard') dashboard() { return this.service.dashboard(); }
  @Get('attention-students') attentionStudents(@Query('semesterId', new ParseIntPipe({ optional: true })) semesterId?: number) { return this.service.attentionStudents(semesterId); }
  @Get('recommendations') recommendations(@Query('semesterId', new ParseIntPipe({ optional: true })) semesterId?: number) { return this.service.recommendations(semesterId); }
  @Get('export') async export(@Res() res: any, @Query('semesterId', new ParseIntPipe({ optional: true })) semesterId?: number) {
    const { semester, students } = await this.service.attentionStudents(semesterId);
    return sendXlsx(res, 'sinh-vien-can-quan-tam.xlsx', ['MSSV', 'Họ tên', 'Lớp', 'Khóa', 'Số HĐ', 'Nhóm thiếu', 'Minh chứng chờ xử lý', 'Mức cảnh báo', 'Đề xuất', semester ?? ''],
      students.map((s) => [s.mssv, s.name, s.className, s.cohort, s.activities, s.missingCriteria, s.pendingRequests, s.warning, s.suggestion]));
  }
}
