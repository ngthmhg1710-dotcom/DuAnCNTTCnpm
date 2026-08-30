import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';

@Controller('mock/partner')
export class IntegrationsController {
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
