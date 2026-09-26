import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, UpdateActivityDto } from './dto/activity.dto';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('activities')
@UseGuards(SessionAuthGuard, RolesGuard)
export class ActivitiesController {
  constructor(private service: ActivitiesService) {}

  @Get() list() {
    return this.service.list();
  }

  @Get(':id') detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }

  @Post()
  @Roles(Role.STAFF, Role.ADMIN)
  create(@Body() dto: CreateActivityDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(Role.STAFF, Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateActivityDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.STAFF, Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
