import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class AppController {
  @Get()
  health() { return { status: 'ok', service: 'student-activity-management-api', timestamp: new Date().toISOString() }; }
}
