import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Patch, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class IntegrationsController {
  constructor(private service: IntegrationsService) {}

  @Get() list() { return this.service.list(); }
  @Get('sync-history') history() { return this.service.history(); }
  @Post() create(@Body() b: any) { return this.service.create(b); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.service.update(id, b); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
  @Post(':id/test') test(@Param('id', ParseIntPipe) id: number) { return this.service.test(id); }
  @Post(':id/sync') sync(@Param('id', ParseIntPipe) id: number) { return this.service.sync(id); }
}

// Đối tác giả lập để thử đồng bộ (không cần đăng nhập, chỉ cần API key).
@Controller('mock/partner')
export class MockPartnerController {
  @Get('students')
  students(@Headers('x-api-key') apiKey?: string) {
    if (apiKey !== (process.env.MOCK_API_KEY || 'mock-partner-key')) {
      throw new UnauthorizedException('API Key không hợp lệ.');
    }
    return {
      source: 'mock-partner',
      data: [
        { mssv: '521H0001', name: 'Nguyễn Minh Tuấn', className: 'TH21A', major: 'CNTT' },
        { mssv: '521H0002', name: 'Trần Thị Bích Ngọc', className: 'TH21B', major: 'HTTT' }
      ]
    };
  }
}
