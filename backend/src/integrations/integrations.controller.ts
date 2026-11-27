import { Body, Controller, Delete, Get, Headers, HttpCode, Param, ParseIntPipe, Patch, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IntegrationsService } from './integrations.service';

@ApiTags('Tích hợp (admin)')
@Controller('integrations')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class IntegrationsController {
  constructor(private service: IntegrationsService) {}

  @Get() list() { return this.service.list(); }
  @Get('sync-history') history() { return this.service.history(); }
  @Get('sync-history/:id/errors') errors(@Param('id', ParseIntPipe) id: number) { return this.service.errors(id); }
  @Post('sync-history/:id/retry') retryLog(@Param('id', ParseIntPipe) id: number) { return this.service.retryLog(id); }
  @Post('errors/:id/retry') retryError(@Param('id', ParseIntPipe) id: number) { return this.service.retryError(id); }
  @Post() create(@Body() b: any) { return this.service.create(b); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.service.update(id, b); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
  @Post(':id/test') test(@Param('id', ParseIntPipe) id: number) { return this.service.test(id); }
  @Post(':id/sync') sync(@Param('id', ParseIntPipe) id: number) { return this.service.sync(id); }
}

// Đối tác ĐẨY dữ liệu vào hệ thống (không đăng nhập, chỉ cần API key của kết nối tương ứng).
// Body: { "data": [ ... ] } cùng định dạng dòng như khi hệ thống kéo; qua cùng luồng Validation → Mapping → Business Logic → DB.
@ApiTags('Partner (đẩy dữ liệu)')
@ApiSecurity('x-api-key')
@Controller('partner')
export class PartnerIngestController {
  constructor(private service: IntegrationsService) {}

  @Post('ingest/:dataType')
  @HttpCode(200)
  @ApiParam({ name: 'dataType', enum: ['students', 'activities', 'participations', 'declarations'] })
  @ApiOperation({ summary: 'Đối tác đẩy dữ liệu vào hệ thống (header x-api-key). 401 thiếu/sai key, 403 key không được cấp cho loại này, 400 body sai, 422 mọi bản ghi đều bị từ chối' })
  ingest(
    @Param('dataType') dataType: string,
    @Body() body: any,
    @Headers('x-api-key') apiKey?: string,
    @Headers('authorization') auth?: string,
  ) {
    return this.service.ingest(dataType, apiKey ?? auth?.replace(/^Bearer /, ''), body);
  }
}

// Đối tác giả lập để thử đồng bộ (không cần đăng nhập, chỉ cần API key).
// Hai endpoint participations/declarations cố ý có vài dòng sai để thử luồng ghi nhận lỗi và thử lại.
@ApiTags('Mock partner')
@ApiSecurity('x-api-key')
@Controller('mock/partner')
export class MockPartnerController {
  private check(apiKey?: string, auth?: string) {
    if (!apiKey && !auth) throw new UnauthorizedException('Thiếu API key (header x-api-key).');
    if ((apiKey ?? auth?.replace(/^Bearer /, '')) !== (process.env.MOCK_API_KEY || 'mock-partner-key')) {
      throw new UnauthorizedException('API Key không hợp lệ.');
    }
  }

  @Get('activities')
  @ApiOperation({ summary: 'Mock: danh sách hoạt động của đối tác (cần header x-api-key)' })
  activities(@Headers('x-api-key') apiKey?: string, @Headers('authorization') auth?: string) {
    this.check(apiKey, auth);
    const at = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
    return {
      source: 'mock-doan-truong',
      data: [
        { externalId: 'DOAN-001', title: 'Hiến máu nhân đạo', category: 'Cộng đồng tình nguyện', unit: 'Đoàn trường', location: 'Hội trường A', startAt: at(14), endAt: at(14.2), capacity: 100 },
        { externalId: 'DOAN-002', title: 'Hội thảo Kỹ năng nghề nghiệp', category: 'Học tập & Học thuật', unit: 'Khoa CNTT', location: 'Phòng B1.02', startAt: at(21), capacity: 150 },
        { externalId: 'DOAN-003', title: 'Giải bóng đá sinh viên', category: 'Chính trị xã hội văn hóa thể thao', unit: 'Hội sinh viên', location: 'Sân vận động', startAt: at(30) },
      ],
    };
  }

  @Get('students')
  @ApiOperation({ summary: 'Mock: danh sách sinh viên của đối tác (cần header x-api-key)' })
  students(@Headers('x-api-key') apiKey?: string, @Headers('authorization') auth?: string) {
    this.check(apiKey, auth);
    return {
      source: 'mock-partner',
      data: [
        { mssv: '521H0001', name: 'Nguyễn Minh Tuấn', className: 'TH21A', major: 'CNTT' },
        { mssv: '521H0002', name: 'Trần Thị Bích Ngọc', className: 'TH21B', major: 'HTTT' }
      ]
    };
  }

  @Get('participations')
  @ApiOperation({ summary: 'Mock: trạng thái tham gia từ đối tác, có 2 dòng sai cố ý (cần header x-api-key)' })
  participations(@Headers('x-api-key') apiKey?: string, @Headers('authorization') auth?: string) {
    this.check(apiKey, auth);
    return {
      source: 'mock-doan-truong',
      data: [
        { mssv: '521H0001', activityExternalId: 'DOAN-001', status: 'REGISTERED' },
        { mssv: '521H0002', activityExternalId: 'DOAN-002', status: 'REGISTERED' },
        { mssv: '521H0003', activityExternalId: 'DOAN-001', status: 'REGISTERED' },
        { mssv: 'KHONGCO', activityExternalId: 'DOAN-001', status: 'REGISTERED' }, // lỗi cố ý: MSSV không tồn tại
        { mssv: '521H0001', activityExternalId: 'KHONG-CO-999', status: 'REGISTERED' }, // lỗi cố ý: hoạt động không tìm thấy
      ],
    };
  }

  @Get('declarations')
  @ApiOperation({ summary: 'Mock: trạng thái khai báo từ đối tác, có 3 dòng sai cố ý (cần header x-api-key)' })
  declarations(@Headers('x-api-key') apiKey?: string, @Headers('authorization') auth?: string) {
    this.check(apiKey, auth);
    return {
      source: 'mock-partner',
      data: [
        { code: 'KB-2026-003', status: 'PROCESSING', note: 'Đối tác đã tiếp nhận' },
        { code: 'KB-2026-004', status: 'PROCESSING', note: 'Đối tác đã tiếp nhận' },
        { code: 'KB-KHONG-CO', status: 'VERIFIED' }, // lỗi cố ý: không tìm thấy khai báo
        { code: 'KB-2026-005', status: 'REJECTED' }, // lỗi cố ý: từ chối nhưng thiếu ghi chú
        { code: 'KB-2026-006', status: 'XYZ' }, // lỗi cố ý: sai định dạng trạng thái
      ],
    };
  }
}
