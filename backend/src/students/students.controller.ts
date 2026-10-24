import { Body, Controller, Get, Param, ParseIntPipe, Post, Res, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { sendXlsx } from '../common/xlsx';
import { Role } from '@prisma/client';

@Controller('students')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.STAFF, Role.ADMIN)
export class StudentsController {
  constructor(private service: StudentsService) {}

  @Get() list() {
    return this.service.list();
  }

  @Get('export') async export(@Res() res: any) {
    const rows = await this.service.list();
    return sendXlsx(res, 'sinh-vien.xlsx', ['MSSV', 'Họ tên', 'Email', 'Lớp', 'Khóa', 'Ngành', 'Trạng thái', 'Số hoạt động', 'Mức tham gia'],
      rows.map((s) => [s.mssv, s.name, s.email, s.className, s.cohort, s.major, s.status, s.activities, s.participation]));
  }

  @Post('import') import(@Body() body: { rows: any[] }) {
    return this.service.importRows(body.rows);
  }

  @Get(':id') detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }
}
