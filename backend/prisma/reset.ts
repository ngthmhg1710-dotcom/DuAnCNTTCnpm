import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const STUDENTS = [
  { username: '521H0001', name: 'Nguyễn Minh Tuấn', mssv: '521H0001', className: 'TH21A', cohort: '2021', major: 'CNTT' },
  { username: '521H0002', name: 'Trần Thị Bích Ngọc', mssv: '521H0002', className: 'TH21A', cohort: '2021', major: 'CNTT' },
  { username: '521H0003', name: 'Lê Văn Hùng', mssv: '521H0003', className: 'TH21B', cohort: '2021', major: 'CNTT' },
  { username: '521H0004', name: 'Phạm Thị Lan Anh', mssv: '521H0004', className: 'TH21B', cohort: '2021', major: 'CNTT' },
  { username: '521H0005', name: 'Hoàng Đức Thịnh', mssv: '521H0005', className: 'TH21C', cohort: '2021', major: 'HTTT' },
  { username: '521H0006', name: 'Võ Thị Mỹ Duyên', mssv: '521H0006', className: 'TH21C', cohort: '2021', major: 'HTTT' },
  { username: '521H0007', name: 'Đặng Quốc Bảo', mssv: '521H0007', className: 'TH22A', cohort: '2022', major: 'CNTT' },
  { username: '521H0008', name: 'Bùi Thị Hồng Nhung', mssv: '521H0008', className: 'TH22A', cohort: '2022', major: 'CNTT' },
];

const ACTIVITIES = [
  { title: 'Hội thảo An toàn thông tin', category: 'Học thuật', unit: 'Khoa CNTT', location: 'Hội trường B', startAt: new Date('2026-09-10T08:00:00+07:00'), capacity: 150 },
  { title: 'Ngày hội tình nguyện mùa hè', category: 'Tình nguyện', unit: 'Đoàn Khoa CNTT', location: 'Khu dân cư Q.7', startAt: new Date('2026-09-18T08:00:00+07:00'), capacity: 300 },
  { title: 'Giải thể thao CNTT', category: 'Văn hóa - Thể thao', unit: 'Đoàn Khoa CNTT', location: 'Sân A - TDTU', startAt: new Date('2026-10-02T08:00:00+07:00'), capacity: 200 },
  { title: 'Workshop Thiết kế UI/UX', category: 'Kỹ năng & Ngoại khóa', unit: 'CLB IT TDTU', location: 'Phòng 5.01', startAt: new Date('2026-10-15T08:00:00+07:00'), capacity: 40 },
  { title: 'Cuộc thi lập trình ACM ICPC', category: 'Học thuật', unit: 'Khoa CNTT', location: 'Phòng máy B201', startAt: new Date('2026-11-05T08:00:00+07:00'), capacity: 60 },
  { title: 'Hiến máu nhân đạo', category: 'Tình nguyện', unit: 'Hội Chữ thập đỏ TDTU', location: 'Sân A - TDTU', startAt: new Date('2026-11-20T07:30:00+07:00'), capacity: 300 },
];

async function main() {
  console.log('🗑️  Đang xóa toàn bộ data cũ...');

  // Xóa theo thứ tự tránh lỗi foreign key
  await prisma.auditLog.deleteMany();
  await prisma.declaration.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.integration.deleteMany();

  console.log('✅ Đã xóa xong! Đang seed data mẫu...');

  // Seed staff & admin
  const staffUsers = [
    { username: 'staff.thu', name: 'Nguyễn Thị Thu', email: 'thu.nt@tdtu.edu.vn', role: Role.STAFF },
    { username: 'staff.quang', name: 'Trần Minh Quang', email: 'quang.tm@tdtu.edu.vn', role: Role.STAFF },
    { username: 'admin.it', name: 'Lê Văn Quản', email: 'quan.lv@tdtu.edu.vn', role: Role.ADMIN },
  ];
  for (const item of staffUsers) {
    await prisma.user.create({ data: item });
  }

  // Seed students
  const students = [];
  for (const s of STUDENTS) {
    const user = await prisma.user.create({
      data: {
        username: s.username,
        name: s.name,
        email: `${s.username.toLowerCase()}@student.tdtu.edu.vn`,
        role: Role.STUDENT,
      },
    });
    const student = await prisma.student.create({
      data: { userId: user.id, mssv: s.mssv, className: s.className, cohort: s.cohort, major: s.major },
    });
    students.push(student);
  }

  // Seed activities
  const activities = [];
  for (const a of ACTIVITIES) {
    const activity = await prisma.activity.create({ data: a });
    activities.push(activity);
  }

  // Seed participations
  const participationPlan: [number, number[], string[]][] = [
    [0, [0, 1, 2, 3, 4, 5], Array(6).fill('ATTENDED')],
    [1, [0, 1, 2, 3], ['ATTENDED', 'ATTENDED', 'ATTENDED', 'REGISTERED']],
    [2, [0], ['ATTENDED']],
    [3, [1, 2], ['ATTENDED', 'REGISTERED']],
    [4, [0, 3], ['ATTENDED', 'ABSENT']],
    [5, [0, 1, 2, 4], ['ATTENDED', 'ATTENDED', 'ATTENDED', 'REGISTERED']],
    [6, [1], ['REGISTERED']],
    [7, [0, 2, 3], ['ATTENDED', 'ATTENDED', 'REGISTERED']],
  ];
  for (const [studentIdx, activityIdxs, statuses] of participationPlan) {
    for (let i = 0; i < activityIdxs.length; i++) {
      await prisma.participation.create({
        data: {
          studentId: students[studentIdx].id,
          activityId: activities[activityIdxs[i]].id,
          status: statuses[i],
        },
      });
    }
  }

  // Seed declarations
  const declarationPlan = [
    { code: 'KB-2026-001', studentIdx: 0, activityName: 'Tham gia CLB Robotics TDTU', unit: 'CLB Robotics', status: 'VERIFIED', handler: 'Nguyễn Thị Thu' },
    { code: 'KB-2026-002', studentIdx: 2, activityName: 'Workshop Python cho Data Science', unit: 'Bên ngoài trường', status: 'PROCESSING', handler: 'Trần Minh Quang' },
    { code: 'KB-2026-003', studentIdx: 3, activityName: 'Cuộc thi Hackathon VietHack', unit: 'VietHack Organization', status: 'NEEDS_MORE_INFO', handler: 'Nguyễn Thị Thu' },
    { code: 'KB-2026-004', studentIdx: 4, activityName: 'Hội thảo An toàn thông tin mạng', unit: 'VNISA', status: 'SUBMITTED' },
    { code: 'KB-2026-005', studentIdx: 6, activityName: 'Giải chạy vì cộng đồng', unit: 'Bên ngoài trường', status: 'REJECTED', handler: 'Nguyễn Thị Thu' },
  ];
  for (const d of declarationPlan) {
    await prisma.declaration.create({
      data: {
        code: d.code,
        studentId: students[d.studentIdx].id,
        activityName: d.activityName,
        unit: d.unit,
        status: d.status as any,
        handler: d.handler,
      },
    });
  }

  console.log('');
  console.log('🎉 Reset hoàn tất! Data mẫu đã được seed:');
  console.log(`   👥 ${staffUsers.length} Staff/Admin accounts`);
  console.log(`   🎓 ${STUDENTS.length} Student accounts`);
  console.log(`   📋 ${ACTIVITIES.length} Activities`);
  console.log(`   📝 ${declarationPlan.length} Declarations`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
