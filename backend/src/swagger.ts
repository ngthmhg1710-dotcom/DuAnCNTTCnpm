// Bổ sung mô tả cho tài liệu Swagger (/docs): nhóm, mô tả từng endpoint và ví dụ dữ liệu gửi lên.
// Để một chỗ thay vì rải decorator ở 80 endpoint. Endpoint nào có @ApiOperation riêng thì giữ nguyên.

const TAGS: [string, string][] = [
  ['/api/auth', 'Xác thực & tài khoản'],
  ['/api/analytics', 'Thống kê'],
  ['/api/integrations', 'Tích hợp (admin)'],
  ['/api/mock/partner', 'Mock partner'],
  ['/api/partner', 'Partner (đẩy dữ liệu)'],
  ['/api/activities', 'Hoạt động'],
  ['/api/students', 'Sinh viên'],
  ['/api/participations', 'Đăng ký & tham gia'],
  ['/api/declarations', 'Khai báo / minh chứng'],
  ['/api/notifications', 'Thông báo'],
  ['/api/roles', 'Vai trò'],
  ['/api/audit-logs', 'Audit log'],
  ['/api/semesters', 'Học kỳ'],
  ['/api/alert-settings', 'Ngưỡng cảnh báo'],
  ['/api/criteria', 'Tiêu chí'],
  ['/api/categories', 'Danh mục'],
];

// "[Vai trò]" cho biết ai gọi được. SV = sinh viên, CB = cán bộ, AD = admin.
const SUMMARY: Record<string, string> = {
  'GET /': 'Kiểm tra dịch vụ đang chạy',
  'GET /health': 'Kiểm tra sức khỏe dịch vụ',
  'POST /api/auth/login': 'Đăng nhập bằng tài khoản/mật khẩu. Thành công thì cookie phiên được lưu và dùng cho mọi endpoint bên dưới',
  'POST /api/auth/oauth/google-token': 'Đăng nhập bằng Google ID token (chỉ email trường)',
  'GET /api/auth/oauth/google': 'Bắt đầu đăng nhập Google OAuth 2.0 (chuyển hướng sang Google)',
  'GET /api/auth/oauth/google/callback': 'Google OAuth gọi lại sau khi người dùng đồng ý',
  'GET /api/auth/me': 'Thông tin người dùng đang đăng nhập',
  'GET /api/auth/users': '[CB, AD] Danh sách tài khoản',
  'POST /api/auth/users': '[CB, AD] Tạo tài khoản (cán bộ chỉ tạo được tài khoản sinh viên)',
  'PATCH /api/auth/users/{id}': '[CB, AD] Sửa tài khoản, đổi vai trò, khóa/mở khóa (status: ACTIVE | INACTIVE)',
  'DELETE /api/auth/users/{id}': '[CB, AD] Xóa tài khoản (không xóa chính mình)',
  'POST /api/auth/refresh': 'Đổi refresh token (cookie) lấy access token mới',
  'POST /api/auth/logout': 'Đăng xuất và thu hồi mọi token đã cấp',
  'GET /api/analytics/overview': '[CB, AD] Số liệu tổng quan',
  'GET /api/analytics/filter-options': '[CB, AD] Giá trị cho các ô lọc: học kỳ, lớp, khóa, loại hoạt động',
  'GET /api/analytics/dashboard': '[CB, AD] Số liệu dashboard, lọc theo ?semesterId, ?className, ?cohort, ?category',
  'GET /api/analytics/reports/{type}': '[CB, AD] Báo cáo dạng bảng: students, history, by-semester, low-participation, verification',
  'GET /api/analytics/reports/{type}/export': '[CB, AD] Xuất báo cáo ra Excel (cùng bộ lọc)',
  'GET /api/analytics/attention-students': '[CB, AD] Sinh viên cần quan tâm theo học kỳ (?semesterId, ?className, ?cohort, ?flag)',
  'GET /api/analytics/recommendations': '[CB, AD] Đề xuất hành động cho cán bộ',
  'GET /api/analytics/export': '[CB, AD] Xuất danh sách sinh viên cần quan tâm ra Excel',
  'GET /api/integrations': '[AD] Danh sách kết nối tích hợp (không trả API key)',
  'POST /api/integrations': '[AD] Thêm kết nối. dataType: STUDENTS | ACTIVITIES | PARTICIPATIONS | DECLARATIONS',
  'GET /api/integrations/sync-history': '[AD] Lịch sử đồng bộ: thời điểm, kết quả, số lỗi còn lại',
  'GET /api/integrations/sync-history/{id}/errors': '[AD] Các bản ghi lỗi của một lần đồng bộ (lý do và dữ liệu gốc)',
  'POST /api/integrations/sync-history/{id}/retry': '[AD] Thử lại tất cả bản ghi lỗi chưa xử lý của một lần đồng bộ',
  'POST /api/integrations/errors/{id}/retry': '[AD] Thử lại một bản ghi lỗi',
  'PATCH /api/integrations/{id}': '[AD] Sửa kết nối, bật/tắt (isActive), đổi API key',
  'DELETE /api/integrations/{id}': '[AD] Xóa kết nối',
  'POST /api/integrations/{id}/test': '[AD] Thử kết nối tới đối tác (gọi baseUrl kèm API key)',
  'POST /api/integrations/{id}/sync': '[AD] Đồng bộ ngay: kéo dữ liệu, kiểm tra, ghi DB, ghi lỗi từng dòng, báo cán bộ nếu lỗi',
  'POST /api/partner/ingest/{dataType}': 'Đối tác ĐẨY dữ liệu vào hệ thống (nút Authorize nhập x-api-key). Thiếu/sai key 401; key không được cấp cho loại này 403; body sai 400; mọi bản ghi bị từ chối 422',
  'GET /api/mock/partner/activities': 'Mock đối tác: hoạt động. Cần header x-api-key (nút Authorize), thiếu/sai trả 401',
  'GET /api/mock/partner/students': 'Mock đối tác: sinh viên. Cần header x-api-key, thiếu/sai trả 401',
  'GET /api/mock/partner/participations': 'Mock đối tác: trạng thái tham gia, có 2 dòng sai cố ý. Cần header x-api-key',
  'GET /api/mock/partner/declarations': 'Mock đối tác: trạng thái khai báo, có 3 dòng sai cố ý. Cần header x-api-key',
  'GET /api/activities': 'Danh sách hoạt động (sinh viên chỉ thấy hoạt động đã công bố)',
  'POST /api/activities': '[CB, AD] Tạo hoạt động (kiểm tra tên, loại, giờ kết thúc sau giờ bắt đầu)',
  'GET /api/activities/{id}': 'Chi tiết hoạt động; cán bộ thấy kèm danh sách người đăng ký',
  'PATCH /api/activities/{id}': '[CB, AD] Sửa hoạt động; đổi trạng thái bằng published / closed / cancelled',
  'DELETE /api/activities/{id}': '[CB, AD] Xóa hoạt động (chỉ khi chưa có ai đăng ký; nếu đã có thì dùng cancelled)',
  'GET /api/students': '[CB, AD] Danh sách sinh viên',
  'GET /api/students/export': '[CB, AD] Xuất danh sách sinh viên ra Excel',
  'POST /api/students/import': '[CB, AD] Import sinh viên từ danh sách dòng; trùng/sai thì báo lỗi từng dòng',
  'GET /api/students/{id}': '[CB, AD] Chi tiết sinh viên: hoạt động và khai báo',
  'GET /api/participations/mine': '[SV] Các hoạt động tôi đã đăng ký (kèm canCancel)',
  'GET /api/participations/history': '[SV] Lịch sử đăng ký, tham gia và khai báo của tôi',
  'POST /api/participations': '[SV] Đăng ký hoạt động (chặn nháp, đã kết thúc, đã đóng/hủy, đủ người, sai đối tượng)',
  'GET /api/participations': '[CB, AD] Danh sách đăng ký, lọc theo activityId / studentId / status',
  'DELETE /api/participations/{activityId}': '[SV] Hủy đăng ký (trước giờ bắt đầu và khi chưa điểm danh)',
  'POST /api/participations/import': '[CB, AD] Import điểm danh theo MSSV (hoạt động đã diễn ra; sinh viên đến thẳng phải đúng đối tượng và còn suất)',
  'PATCH /api/participations/{id}': '[CB, AD] Đổi trạng thái tham gia: REGISTERED | ATTENDED | ABSENT | CANCELLED; có audit log',
  'GET /api/declarations': 'Danh sách khai báo (sinh viên thấy của mình, cán bộ thấy tất cả)',
  'POST /api/declarations': '[SV] Gửi khai báo hoạt động ngoài trường kèm minh chứng',
  'GET /api/declarations/{code}': 'Chi tiết khai báo theo mã',
  'PATCH /api/declarations/{code}': '[CB, AD] Xử lý khai báo: receive | approve | reject | supplement',
  'GET /api/notifications': 'Thông báo của tôi (mọi vai trò)',
  'POST /api/notifications': '[CB, AD] Gửi thông báo cho sinh viên (tất cả, theo lớp hoặc theo khóa)',
  'GET /api/notifications/sent': '[CB, AD] Thông báo tôi đã gửi',
  'PATCH /api/notifications/read-all': 'Đánh dấu đã đọc tất cả thông báo của tôi',
  'PATCH /api/notifications/{id}/read': 'Đánh dấu đã đọc một thông báo',
  'GET /api/roles': '[AD] Danh sách vai trò và quyền',
  'POST /api/roles': '[AD] Tạo vai trò',
  'PATCH /api/roles/{id}': '[AD] Sửa vai trò / ma trận quyền',
  'DELETE /api/roles/{id}': '[AD] Xóa vai trò',
  'GET /api/audit-logs': '[AD] Nhật ký thao tác (ai, làm gì, lúc nào, kết quả)',
  'GET /api/alert-settings': '[CB, AD] Xem ngưỡng cảnh báo sinh viên',
  'PUT /api/alert-settings': '[CB, AD] Đổi ngưỡng cảnh báo (lowBelow, mediumBelow, targetPoints, manyPending, riskAfterPct)',
  'GET /api/semesters': 'Danh sách học kỳ',
  'POST /api/semesters': '[CB, AD] Thêm học kỳ',
  'PATCH /api/semesters/{id}': '[CB, AD] Sửa học kỳ',
  'DELETE /api/semesters/{id}': '[CB, AD] Xóa học kỳ (xóa luôn tiêu chí của học kỳ)',
  'POST /api/semesters/{id}/current': '[CB, AD] Đặt làm học kỳ hiện tại',
  'GET /api/criteria/progress': '[SV] Tiến độ tiêu chí và điểm ước tính của tôi (điểm tham khảo)',
  'GET /api/criteria/progress/{id}': '[SV] Chi tiết một tiêu chí kèm hoạt động gợi ý',
  'GET /api/criteria/students/{studentId}/progress': '[CB, AD] Tiến độ tiêu chí của một sinh viên',
  'GET /api/criteria/summary': '[CB, AD] Điểm ước tính của mọi sinh viên theo học kỳ (?semesterId, ?className, ?cohort, ?flag)',
  'GET /api/criteria': '[CB, AD] Danh sách tiêu chí',
  'POST /api/criteria': '[CB, AD] Thêm tiêu chí',
  'PATCH /api/criteria/{id}': '[CB, AD] Sửa tiêu chí',
  'DELETE /api/criteria/{id}': '[CB, AD] Xóa tiêu chí',
  'GET /api/categories': 'Danh mục theo loại (?type=ACTIVITY | UNIT | CRITERIA_GROUP | CLASS | COHORT)',
  'POST /api/categories': '[AD] Thêm danh mục',
  'PATCH /api/categories/{id}': '[AD] Đổi tên danh mục (cập nhật luôn dữ liệu đang dùng)',
  'DELETE /api/categories/{id}': '[AD] Xóa danh mục (chặn khi đang được dùng)',
};

// Ví dụ dữ liệu gửi lên để "Try it out" có sẵn nội dung đúng.
const BODY: Record<string, unknown> = {
  'POST /api/auth/login': { username: 'staff.thu', password: 'Tdtu@12345' },
  'POST /api/integrations': { name: 'Đối tác giả lập', baseUrl: 'https://student-activity-api-w982.onrender.com/api/mock/partner', authType: 'API_KEY', dataType: 'PARTICIPATIONS', apiKey: 'mock-partner-key', isActive: true },
  'PATCH /api/integrations/{id}': { isActive: false },
  'POST /api/partner/ingest/{dataType}': { data: [{ mssv: '521H0001', activityExternalId: 'DOAN-001', status: 'REGISTERED' }, { mssv: 'KHONGCO', activityExternalId: 'DOAN-001', status: 'REGISTERED' }] },
  'POST /api/activities': { title: 'Hội thảo mẫu', category: 'Học tập & Học thuật', ruleCode: '4.2', points: 5, startAt: '2027-03-01T01:00:00.000Z', endAt: '2027-03-01T04:00:00.000Z', capacity: 100, targetClasses: [], published: false },
  'PATCH /api/activities/{id}': { closed: true },
  'POST /api/participations': { activityId: 1 },
  'POST /api/participations/import': { activityId: 1, rows: [{ mssv: '521H0001' }, { mssv: '521H0002' }] },
  'PATCH /api/participations/{id}': { status: 'ATTENDED' },
  'POST /api/students/import': { rows: [{ mssv: '521H9999', name: 'Nguyễn Văn Mẫu', className: 'TH21A', cohort: '2021', major: 'CNTT' }] },
  'POST /api/categories': { type: 'CLASS', name: 'TH21A' },
  'PATCH /api/categories/{id}': { name: 'Tên mới' },
  'POST /api/semesters': { name: 'HK2', year: '2026-2027', startDate: '2027-02-01', endDate: '2027-06-30' },
  'POST /api/criteria': { semesterId: 1, group: 'Học tập & Học thuật', name: 'Học tập và hoạt động chuyên môn', requirement: 2, points: 20 },
  'POST /api/notifications': { title: 'Nhắc nhở', message: 'Nội dung thông báo', className: 'TH21A' },
  'PATCH /api/declarations/{code}': { action: 'approve', note: 'Minh chứng hợp lệ' },
  'POST /api/auth/users': { username: '521H9998', name: 'Nguyễn Văn Mẫu', email: '521h9998@student.tdtu.edu.vn', password: 'Tdtu@12345' },
};

export function describeDocument(doc: any) {
  for (const [path, ops] of Object.entries<any>(doc.paths)) {
    for (const [method, op] of Object.entries<any>(ops)) {
      const key = `${method.toUpperCase()} ${path}`;
      op.summary ??= SUMMARY[key] ?? key;
      if (!op.tags?.length) op.tags = [TAGS.find(([prefix]) => path.startsWith(prefix))?.[1] ?? 'Hệ thống'];
      if (BODY[key] !== undefined) {
        op.requestBody ??= { required: true, content: {} };
        op.requestBody.content['application/json'] ??= { schema: { type: 'object' } };
        op.requestBody.content['application/json'].example = BODY[key];
      }
    }
  }
  return doc;
}
