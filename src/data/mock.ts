export const currentUser = {
  role: 'student' as 'student' | 'staff' | 'admin',
  mssv: '521H0001',
  name: 'Nguyễn Minh Tuấn',
  email: 'tuannm.521H0001@student.tdtu.edu.vn',
  class: 'TH21A',
  cohort: '2021',
  major: 'Công nghệ Thần Thông Tin',
  status: 'Đang học',
  semester: 'HK1 2024-2025',
  avatar: 'NT',
}

export const activities = [
  { id: 1, name: 'Ngày hội tình nguyện mùa hè 2024', type: 'Tình nguyện', unit: 'Đoàn Khoa CNTT', semester: 'HK1 2024-2025', startDate: '2024-06-15', endDate: '2024-06-16', time: '07:00 - 17:00', location: 'Khu dân cư Q.7', capacity: 200, registered: 178, status: 'Đang mở', description: 'Hoạt động tình nguyện giúp đỡ cộng đồng tại khu dân cư Quận 7, bao gồm dọn dẹp vệ sinh, hỗ trợ người già neo đơn và trẻ em.' },
  { id: 2, name: 'Hội thảo kỹ năng mềm – Giao tiếp & Thuyết trình', type: 'Học thuật', unit: 'CLB Kỹ năng TDTU', semester: 'HK1 2024-2025', startDate: '2024-07-10', endDate: '2024-07-10', time: '13:00 - 17:00', location: 'Hội trường A', capacity: 100, registered: 95, status: 'Đang mở', description: 'Hội thảo rèn luyện kỹ năng giao tiếp và thuyết trình cho sinh viên.' },
  { id: 3, name: 'Cuộc thi lập trình ACM ICPC 2024', type: 'Học thuật', unit: 'Khoa CNTT', semester: 'HK1 2024-2025', startDate: '2024-08-20', endDate: '2024-08-21', time: '08:00 - 18:00', location: 'Phòng máy B201', capacity: 60, registered: 58, status: 'Đã kết thúc', description: 'Cuộc thi lập trình cấp trường, vòng loại cho cuộc thi khu vực.' },
  { id: 4, name: 'Hiến máu nhân đạo lần 3 năm 2024', type: 'Tình nguyện', unit: 'Hội Chữ thập đỏ TDTU', semester: 'HK1 2024-2025', startDate: '2024-09-05', endDate: '2024-09-05', time: '07:30 - 11:30', location: 'Sân A - TDTU', capacity: 300, registered: 241, status: 'Đang mở', description: 'Ngày hiến máu nhân đạo thường niên tại trường, đóng góp cho ngân hàng máu TP.HCM.' },
  { id: 5, name: 'Seminar AI & Machine Learning trong doanh nghiệp', type: 'Học thuật', unit: 'Khoa CNTT', semester: 'HK1 2024-2025', startDate: '2024-10-01', endDate: '2024-10-01', time: '09:00 - 12:00', location: 'Hội trường B', capacity: 150, registered: 142, status: 'Đang mở', description: 'Seminar chuyên đề về ứng dụng AI và Machine Learning trong môi trường doanh nghiệp.' },
  { id: 6, name: 'Chào đón tân sinh viên K2024', type: 'Văn hóa – Văn nghệ', unit: 'Đoàn Trường TDTU', semester: 'HK1 2024-2025', startDate: '2024-10-15', endDate: '2024-10-15', time: '17:00 - 21:00', location: 'Sân khấu chính TDTU', capacity: 500, registered: 487, status: 'Đang mở', description: 'Chương trình chào đón tân sinh viên khóa 2024, giao lưu văn nghệ và hoạt động nhóm.' },
  { id: 7, name: 'Workshop Thiết kế UI/UX cho ứng dụng di động', type: 'Học thuật', unit: 'CLB IT TDTU', semester: 'HK2 2024-2025', startDate: '2024-11-08', endDate: '2024-11-09', time: '08:00 - 17:00', location: 'Phòng 5.01 – Tòa A', capacity: 40, registered: 38, status: 'Đang mở', description: 'Workshop thực hành thiết kế UI/UX sử dụng Figma, dành cho sinh viên quan tâm đến thiết kế ứng dụng.' },
  { id: 8, name: 'Hội trại sinh viên CNTT 2024', type: 'Văn hóa – Văn nghệ', unit: 'Đoàn Khoa CNTT', semester: 'HK2 2024-2025', startDate: '2024-12-20', endDate: '2024-12-22', time: 'Cả ngày', location: 'Trại Hè Bình Châu', capacity: 120, registered: 115, status: 'Đang mở', description: 'Trại hè thường niên của sinh viên Khoa CNTT, tăng cường gắn kết và rèn luyện kỹ năng sống.' },
]

export const students = [
  { id: 1, mssv: '521H0001', name: 'Nguyễn Minh Tuấn', class: 'TH21A', cohort: '2021', major: 'CNTT', status: 'Đang học', activities: 8, participation: 'Cao' },
  { id: 2, mssv: '521H0002', name: 'Trần Thị Bích Ngọc', class: 'TH21A', cohort: '2021', major: 'CNTT', status: 'Đang học', activities: 5, participation: 'Trung bình' },
  { id: 3, mssv: '521H0003', name: 'Lê Văn Hùng', class: 'TH21B', cohort: '2021', major: 'CNTT', status: 'Đang học', activities: 2, participation: 'Thấp' },
  { id: 4, mssv: '521H0004', name: 'Phạm Thị Lan Anh', class: 'TH21B', cohort: '2021', major: 'CNTT', status: 'Đang học', activities: 11, participation: 'Cao' },
  { id: 5, mssv: '521H0005', name: 'Hoàng Đức Thịnh', class: 'TH21C', cohort: '2021', major: 'HTTT', status: 'Đang học', activities: 3, participation: 'Thấp' },
  { id: 6, mssv: '521H0006', name: 'Võ Thị Mỹ Duyên', class: 'TH21C', cohort: '2021', major: 'HTTT', status: 'Đang học', activities: 7, participation: 'Cao' },
  { id: 7, mssv: '521H0007', name: 'Đặng Quốc Bảo', class: 'TH22A', cohort: '2022', major: 'CNTT', status: 'Đang học', activities: 4, participation: 'Trung bình' },
  { id: 8, mssv: '521H0008', name: 'Bùi Thị Hồng Nhung', class: 'TH22A', cohort: '2022', major: 'CNTT', status: 'Đang học', activities: 6, participation: 'Trung bình' },
]

export const declarations = [
  { id: 'KB-2024-001', name: 'Tham gia CLB Robotics TDTU', unit: 'CLB Robotics', submittedDate: '2024-09-10', status: 'Đã xác minh', handler: 'Nguyễn Thị Thu' },
  { id: 'KB-2024-002', name: 'Workshop Python cho Data Science', unit: 'Bên ngoài trường', submittedDate: '2024-09-25', status: 'Đang xử lý', handler: 'Trần Minh Quang' },
  { id: 'KB-2024-003', name: 'Cuộc thi Hackathon VietHack 2024', unit: 'VietHack Organization', submittedDate: '2024-10-02', status: 'Cần bổ sung', handler: 'Nguyễn Thị Thu' },
  { id: 'KB-2024-004', name: 'Hội thảo An toàn thông tin mạng', unit: 'VNISA', submittedDate: '2024-10-15', status: 'Đã gửi', handler: '—' },
]

export const notifications = [
  { id: 1, type: 'Xác minh', title: 'Khai báo KB-2024-001 đã được xác minh', message: 'Khai báo hoạt động "Tham gia CLB Robotics TDTU" của bạn đã được xác minh thành công.', time: '10 phút trước', read: false },
  { id: 2, type: 'Bổ sung', title: 'Yêu cầu bổ sung minh chứng', message: 'Khai báo KB-2024-003 cần bổ sung ảnh chứng nhận tham gia từ ban tổ chức.', time: '2 giờ trước', read: false },
  { id: 3, type: 'Nhắc nhở', title: 'Tiêu chí HK1 sắp kết thúc', message: 'Còn 15 ngày để hoàn thành tiêu chí Hoạt động tình nguyện học kỳ này.', time: '1 ngày trước', read: true },
  { id: 4, type: 'Hoạt động mới', title: 'Hoạt động mới: Hội trại sinh viên CNTT 2024', message: 'Đã có hoạt động mới phù hợp với tiêu chí của bạn. Đăng ký trước 15/12.', time: '2 ngày trước', read: true },
  { id: 5, type: 'Xác minh', title: 'Khai báo KB-2024-002 đang được xử lý', message: 'Cán bộ đã tiếp nhận và đang xem xét khai báo của bạn.', time: '3 ngày trước', read: true },
]

export const verifications = [
  { id: 'XV-2024-001', student: 'Nguyễn Minh Tuấn', mssv: '521H0001', activity: 'CLB Robotics TDTU', unit: 'CLB Robotics', submittedDate: '2024-09-10', status: 'Đã xác minh', handler: 'Nguyễn Thị Thu' },
  { id: 'XV-2024-002', student: 'Lê Văn Hùng', mssv: '521H0003', activity: 'Python Workshop', unit: 'Bên ngoài', submittedDate: '2024-09-25', status: 'Chờ xử lý', handler: '—' },
  { id: 'XV-2024-003', student: 'Trần Thị Bích Ngọc', mssv: '521H0002', activity: 'VietHack 2024', unit: 'VietHack', submittedDate: '2024-10-02', status: 'Cần bổ sung', handler: 'Trần Minh Quang' },
  { id: 'XV-2024-004', student: 'Phạm Thị Lan Anh', mssv: '521H0004', activity: 'VNISA Seminar', unit: 'VNISA', submittedDate: '2024-10-15', status: 'Chờ xử lý', handler: '—' },
  { id: 'XV-2024-005', student: 'Hoàng Đức Thịnh', mssv: '521H0005', activity: 'Tình nguyện Q.7', unit: 'Đoàn Khoa', submittedDate: '2024-10-18', status: 'Từ chối', handler: 'Nguyễn Thị Thu' },
]

export const semesters = [
  { id: 1, name: 'HK1 2024-2025', year: '2024-2025', start: '01/09/2024', end: '31/01/2025', status: 'Hiện tại' },
  { id: 2, name: 'HK2 2023-2024', year: '2023-2024', start: '01/02/2024', end: '31/08/2024', status: 'Đã kết thúc' },
  { id: 3, name: 'HK1 2023-2024', year: '2023-2024', start: '01/09/2023', end: '31/01/2024', status: 'Đã kết thúc' },
]

export const criteria = [
  { id: 1, group: 'Tình nguyện & Cộng đồng', name: 'Hoạt động tình nguyện', requirement: 2, method: 'Đếm số lần', activities: 3, semester: 'HK1 2024-2025', status: 'Đang áp dụng' },
  { id: 2, group: 'Học thuật & Chuyên môn', name: 'Seminar / Hội thảo chuyên ngành', requirement: 1, method: 'Đếm số lần', activities: 5, semester: 'HK1 2024-2025', status: 'Đang áp dụng' },
  { id: 3, group: 'Học thuật & Chuyên môn', name: 'Cuộc thi lập trình', requirement: 1, method: 'Đếm số lần', activities: 2, semester: 'HK1 2024-2025', status: 'Đang áp dụng' },
  { id: 4, group: 'Văn hóa & Thể thao', name: 'Hoạt động văn hóa văn nghệ', requirement: 1, method: 'Đếm số lần', activities: 4, semester: 'HK1 2024-2025', status: 'Đang áp dụng' },
]

export const accounts = [
  { id: 1, username: '521H0001', name: 'Nguyễn Minh Tuấn', email: 'tuannm@student.tdtu.edu.vn', role: 'Sinh viên', status: 'Hoạt động', lastLogin: '18/08/2026 09:32', created: '01/09/2021' },
  { id: 2, username: 'staff.thu', name: 'Nguyễn Thị Thu', email: 'thu.nt@tdtu.edu.vn', role: 'Cán bộ', status: 'Hoạt động', lastLogin: '18/08/2026 08:15', created: '15/08/2019' },
  { id: 3, username: 'admin.it', name: 'Lê Văn Quản', email: 'quan.lv@tdtu.edu.vn', role: 'Admin', status: 'Hoạt động', lastLogin: '17/08/2026 17:45', created: '01/01/2020' },
  { id: 4, username: '521H0003', name: 'Lê Văn Hùng', email: 'hunglv@student.tdtu.edu.vn', role: 'Sinh viên', status: 'Đang học', lastLogin: '15/08/2026 14:22', created: '01/09/2021' },
  { id: 5, username: 'staff.quang', name: 'Trần Minh Quang', email: 'quang.tm@tdtu.edu.vn', role: 'Cán bộ', status: 'Hoạt động', lastLogin: '16/08/2026 11:30', created: '20/03/2020' },
]

export const integrations = [
  { id: 1, name: 'Phòng CTSV', baseUrl: 'https://api.ctsv.tdtu.edu.vn/v2', auth: 'API Key', status: 'Kết nối', lastSync: '18/08/2026 08:00' },
  { id: 2, name: 'Hệ thống QLSV', baseUrl: 'https://qlsv.tdtu.edu.vn/api', auth: 'OAuth 2.0', status: 'Kết nối', lastSync: '18/08/2026 07:30' },
  { id: 3, name: 'Hệ thống Hoạt động', baseUrl: 'https://activity.tdtu.edu.vn/api', auth: 'Bearer Token', status: 'Lỗi', lastSync: '17/08/2026 22:15' },
  { id: 4, name: 'Mock API', baseUrl: 'https://mockapi.io/tdtu', auth: 'API Key', status: 'Kết nối', lastSync: '18/08/2026 09:00' },
]

export const auditLogs = [
  { id: 1, time: '18/08/2026 09:32', user: 'admin.it', role: 'Admin', action: 'UPDATE', object: 'Account', objectId: '521H0003', status: 'Thành công' },
  { id: 2, time: '18/08/2026 09:15', user: 'staff.thu', role: 'Cán bộ', action: 'APPROVE', object: 'Declaration', objectId: 'KB-2024-001', status: 'Thành công' },
  { id: 3, time: '18/08/2026 08:55', user: 'staff.quang', role: 'Cán bộ', action: 'REJECT', object: 'Declaration', objectId: 'XV-2024-005', status: 'Thành công' },
  { id: 4, time: '18/08/2026 08:30', user: 'admin.it', role: 'Admin', action: 'CREATE', object: 'Integration', objectId: 'INT-004', status: 'Thành công' },
  { id: 5, time: '17/08/2026 17:45', user: '521H0001', role: 'Sinh viên', action: 'CREATE', object: 'Declaration', objectId: 'KB-2024-004', status: 'Thành công' },
]

export const syncHistory = [
  { id: 1, integration: 'Phòng CTSV', time: '18/08/2026 08:00', records: 1247, success: 1241, failed: 6, duration: '2m 34s', status: 'Thành công' },
  { id: 2, integration: 'QLSV', time: '18/08/2026 07:30', records: 856, success: 856, failed: 0, duration: '1m 48s', status: 'Thành công' },
  { id: 3, integration: 'Hệ thống HĐ', time: '17/08/2026 22:15', records: 124, success: 89, failed: 35, duration: '4m 12s', status: 'Lỗi một phần' },
]
