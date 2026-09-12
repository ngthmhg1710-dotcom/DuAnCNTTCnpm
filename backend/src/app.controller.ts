import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  root(@Res() res: Response) {
    return res.redirect('/docs');
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'student-activity-management-api', timestamp: new Date().toISOString() };
  }
}
