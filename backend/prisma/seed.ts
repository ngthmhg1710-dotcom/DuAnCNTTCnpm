import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { username: '521H0001', name: 'Nguyễn Minh Tuấn', email: 'tuannm@student.tdtu.edu.vn', role: Role.STUDENT },
    { username: 'staff.thu', name: 'Nguyễn Thị Thu', email: 'thu.nt@tdtu.edu.vn', role: Role.STAFF },
    { username: 'admin.it', name: 'Lê Văn Quản', email: 'quan.lv@tdtu.edu.vn', role: Role.ADMIN }
  ];

  for (const item of users) {
    const user = await prisma.user.upsert({
      where: { username: item.username },
      update: { name: item.name, email: item.email, role: item.role, status: 'ACTIVE' },
      create: { ...item },
    });
    if (item.role === Role.STUDENT) {
      await prisma.student.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, mssv: '521H0001', className: 'TH21A', cohort: '2021', major: 'CNTT' }
      });
    }
  }

  await prisma.activity.createMany({
    data: [
      { title: 'Hội thảo An toàn thông tin', category: 'Học thuật', startAt: new Date('2026-09-10T08:00:00+07:00'), capacity: 150 },
      { title: 'Ngày hội tình nguyện', category: 'Tình nguyện', startAt: new Date('2026-09-18T08:00:00+07:00'), capacity: 300 },
      { title: 'Giải thể thao CNTT', category: 'Văn hóa - Thể thao', startAt: new Date('2026-10-02T08:00:00+07:00'), capacity: 200 }
    ],
    skipDuplicates: true
  });
}

main().finally(() => prisma.$disconnect());
