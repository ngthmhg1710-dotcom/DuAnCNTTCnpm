import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DeclarationStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { declarationStatusLabel } from '../common/declaration-status.util';
import { ReviewDeclarationDto } from './dto/review-declaration.dto';

@Injectable()
export class DeclarationsService {
  constructor(private prisma: PrismaService) {}

  private present(d: any) {
    return {
      code: d.code,
      student: d.student.user.name,
      mssv: d.student.mssv,
      activity: d.activityName,
      unit: d.unit,
      submittedDate: d.submittedAt,
      status: declarationStatusLabel(d.status),
      handler: d.handler ?? '—',
      reviewNote: d.reviewNote ?? null,
      ...((d.details as object) ?? {}),
    };
  }

  async create(dto: { activityName: string; unit: string; type?: string; startDate?: string; endDate?: string; location?: string; content?: string; description?: string; files?: { name: string; data: string }[] }, studentUserId: number) {
    const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
    if (!student) throw new BadRequestException('Không tìm thấy thông tin sinh viên.');

    const count = await this.prisma.declaration.count();
    const code = `KB-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const declaration = await this.prisma.declaration.create({
      data: {
        code,
        studentId: student.id,
        activityName: dto.activityName || 'Khai báo mới',
        unit: dto.unit || 'Đơn vị ngoài',
        status: 'SUBMITTED',
        details: {
          type: dto.type,
          startDate: dto.startDate,
          endDate: dto.endDate,
          location: dto.location,
          content: dto.content,
          description: dto.description,
          files: Array.isArray(dto.files) ? dto.files.slice(0, 3) : [],
        },
      },
      include: { student: { include: { user: true } } },
    });

    return this.present(declaration);
  }

  async listForStudent(userId: number) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) return [];
    const declarations = await this.prisma.declaration.findMany({
      where: { studentId: student.id },
      include: { student: { include: { user: true } } },
      orderBy: { submittedAt: 'desc' },
    });
    return declarations.map((d) => this.present(d));
  }

  async list() {
    const declarations = await this.prisma.declaration.findMany({
      include: { student: { include: { user: true } } },
      orderBy: { submittedAt: 'desc' },
    });
    return declarations.map((d) => this.present(d));
  }

  async detail(code: string) {
    const declaration = await this.findOrThrow(code);
    return this.present(declaration);
  }

  async review(code: string, dto: ReviewDeclarationDto, handlerName: string) {
    const declaration = await this.findOrThrow(code);

    const transitions: Record<string, { from: DeclarationStatus[]; to: DeclarationStatus; requiresNote?: boolean }> = {
      receive: { from: ['SUBMITTED'], to: 'PROCESSING' },
      approve: { from: ['SUBMITTED', 'PROCESSING'], to: 'VERIFIED' },
      reject: { from: ['SUBMITTED', 'PROCESSING', 'NEEDS_MORE_INFO'], to: 'REJECTED', requiresNote: true },
      supplement: { from: ['SUBMITTED', 'PROCESSING'], to: 'NEEDS_MORE_INFO', requiresNote: true },
    };
    const transition = transitions[dto.action];
    if (!transition.from.includes(declaration.status)) {
      throw new BadRequestException(`Không thể thực hiện "${dto.action}" ở trạng thái hiện tại.`);
    }
    if (transition.requiresNote && !dto.note?.trim()) {
      throw new BadRequestException('Vui lòng nhập lý do.');
    }

    const updated = await this.prisma.declaration.update({
      where: { code },
      data: {
        status: transition.to,
        handler: handlerName,
        reviewNote: dto.note ?? declaration.reviewNote,
      },
      include: { student: { include: { user: true } } },
    });
    return this.present(updated);
  }

  private async findOrThrow(code: string) {
    const declaration = await this.prisma.declaration.findUnique({
      where: { code },
      include: { student: { include: { user: true } } },
    });
    if (!declaration) throw new NotFoundException('Không tìm thấy khai báo.');
    return declaration;
  }
}
