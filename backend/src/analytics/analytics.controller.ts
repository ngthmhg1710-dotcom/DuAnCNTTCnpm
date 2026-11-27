import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query, Res, UseGuards } from '@nestjs/common';
import { AnalyticsService, REPORT_TYPES, type Filters } from './analytics.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { sendXlsx } from '../common/xlsx';
import { Role } from '@prisma/client';

const opt = (v?: string) => v?.trim() || undefined;
const toFilters = (semesterId?: number, className?: string, cohort?: string, category?: string): Filters => ({ semesterId, className: opt(className), cohort: opt(cohort), category: opt(category) });
const semesterPipe = new ParseIntPipe({ optional: true });

@Controller('analytics')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.STAFF, Role.ADMIN)
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}
  @Get('overview') overview() { return this.service.overview(); }
  @Get('filter-options') filterOptions() { return this.service.filterOptions(); }
  @Get('dashboard') dashboard(@Query('semesterId', semesterPipe) semesterId?: number, @Query('className') className?: string, @Query('cohort') cohort?: string, @Query('category') category?: string) {
    return this.service.dashboard(toFilters(semesterId, className, cohort, category));
  }
  @Get('attention-students') attentionStudents(@Query('semesterId', semesterPipe) semesterId?: number) { return this.service.attentionStudents(semesterId); }
  @Get('recommendations') recommendations(@Query('semesterId', semesterPipe) semesterId?: number) { return this.service.recommendations(semesterId); }

  // Báo cáo dạng bảng (xem trên web) và bản Excel của cùng dữ liệu.
  @Get('reports/:type') report(@Param('type') type: string, @Query('semesterId', semesterPipe) semesterId?: number, @Query('className') className?: string, @Query('cohort') cohort?: string, @Query('category') category?: string) {
    return this.service.report(this.type(type), toFilters(semesterId, className, cohort, category));
  }
  @Get('reports/:type/export') async exportReport(@Res() res: any, @Param('type') type: string, @Query('semesterId', semesterPipe) semesterId?: number, @Query('className') className?: string, @Query('cohort') cohort?: string, @Query('category') category?: string) {
    const r = await this.service.report(this.type(type), toFilters(semesterId, className, cohort, category));
    return sendXlsx(res, `bao-cao-${type}.xlsx`, r.columns, r.rows);
  }

  @Get('export') async export(@Res() res: any, @Query('semesterId', semesterPipe) semesterId?: number) {
    const r = await this.service.report('low-participation', { semesterId });
    return sendXlsx(res, 'sinh-vien-can-quan-tam.xlsx', r.columns, r.rows);
  }

  private type(t: string) {
    if (!(REPORT_TYPES as readonly string[]).includes(t)) throw new NotFoundException(`Loại báo cáo không hợp lệ. Dùng: ${REPORT_TYPES.join(' | ')}`);
    return t as (typeof REPORT_TYPES)[number];
  }
}
