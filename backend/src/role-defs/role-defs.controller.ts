import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

const defaults = [
  { name: 'Sinh viên', desc: 'Xem và đăng ký hoạt động, khai báo, theo dõi tiêu chí' },
  { name: 'Cán bộ', desc: 'Quản lý hoạt động, sinh viên, xác minh khai báo, thống kê' },
  { name: 'Admin', desc: 'Quản trị toàn bộ hệ thống, tài khoản, phân quyền, tích hợp' },
];
type Body_ = { name?: string; desc?: string; status?: string };
const pick = ({ name, desc, status }: Body_) => ({ name: name?.trim(), desc, status });

@Controller('roles')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class RoleDefsController {
  constructor(private prisma: PrismaService) {}

  @Get() async list() {
    if (!(await this.prisma.roleDef.count())) await this.prisma.roleDef.createMany({ data: defaults });
    return this.prisma.roleDef.findMany({ orderBy: { id: 'asc' } });
  }

  @Post() create(@Body() b: Body_) {
    return this.prisma.roleDef.create({ data: { ...pick(b), name: b.name!.trim() } });
  }

  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() b: Body_) {
    return this.prisma.roleDef.update({ where: { id }, data: pick(b) });
  }

  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.roleDef.delete({ where: { id } });
  }
}
