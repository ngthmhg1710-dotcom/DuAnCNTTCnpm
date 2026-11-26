import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { CATEGORY_TYPES, CategoriesService, type CategoryType } from './categories.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class CategoryDto {
  @IsIn(CATEGORY_TYPES) type!: CategoryType;
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString() @MinLength(1) @MaxLength(100) name!: string;
}

class RenameDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString() @MinLength(1) @MaxLength(100) name!: string;
}

@Controller('categories')
@UseGuards(SessionAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  // Ai đăng nhập cũng đọc được (dùng cho dropdown khi tạo hoạt động/tiêu chí).
  @Get() list(@Query('type') type: string) {
    return this.service.list((CATEGORY_TYPES as readonly string[]).includes(type) ? (type as CategoryType) : 'ACTIVITY');
  }

  @Post() @Roles(Role.ADMIN, Role.STAFF)
  create(@Body() dto: CategoryDto) {
    return this.service.create(dto.type, dto.name);
  }

  @Patch(':id') @Roles(Role.ADMIN, Role.STAFF)
  rename(@Param('id', ParseIntPipe) id: number, @Body() dto: RenameDto) {
    return this.service.rename(id, dto.name);
  }

  @Delete(':id') @Roles(Role.ADMIN, Role.STAFF)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
