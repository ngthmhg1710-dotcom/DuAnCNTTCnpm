// Bảng điểm theo Quy chế đánh giá kết quả rèn luyện TDTU (áp dụng từ năm học 2025-2026).
// Mỗi mục lớn (Điều) tối đa 20 điểm. Chỉ gồm các mục gắn với một hoạt động cụ thể; các mục không phải hoạt động
// (Điều 5 Nội quy, Điều 4.8 kết quả học tập, Điều 8.4 số lượng hoạt động) không chọn ở đây.
// `variable`: quy chế không ghi điểm cố định, cán bộ tự nhập (tối đa `points`).

export type DrlOption = { code: string; label: string; points: number; variable?: boolean }
export type DrlItem = { label: string; options: DrlOption[] }
export type DrlSection = { name: string; article: string; items: DrlItem[] }

export const DRL_SECTION_MAX = 20

const tasks = (code: string, [xs, tot, ht]: number[]): DrlOption[] => [
  { code: `${code}a`, label: 'Hoàn thành xuất sắc nhiệm vụ', points: xs },
  { code: `${code}b`, label: 'Hoàn thành tốt nhiệm vụ', points: tot },
  { code: `${code}c`, label: 'Hoàn thành nhiệm vụ', points: ht },
]
const prizes = (code: string, [nhat, nhi, ba, kk]: number[]): DrlOption[] => [
  { code: `${code}a`, label: 'Giải nhất', points: nhat },
  { code: `${code}b`, label: 'Giải nhì', points: nhi },
  { code: `${code}c`, label: 'Giải ba', points: ba },
  { code: `${code}d`, label: 'Giải khuyến khích', points: kk },
]
const once = (code: string, label: string, points: number, variable = false): DrlOption[] => [{ code, label, points, variable }]

export const DRL_SECTIONS: DrlSection[] = [
  {
    name: 'Học tập & Học thuật',
    article: 'Điều 4',
    items: [
      { label: '1. Thi học thuật, NCKH, ý tưởng sáng tạo, khởi nghiệp', options: [
        { code: '4.1a', label: 'Cấp Lớp/Chi Đoàn/Chi Hội/Khoa/Phân hiệu', points: 10 },
        { code: '4.1b', label: 'Cấp Trường', points: 15 },
        { code: '4.1c', label: 'Cấp Thành trở lên; bài báo WoS/Scopus, tạp chí HĐGSNN (≥ 0.5); báo cáo hội thảo quốc tế', points: 20 },
      ] },
      { label: '2. Hội thảo khoa học, sinh hoạt chuyên đề, định hướng nghề nghiệp, tham quan thực tế', options: once('4.2', 'Mỗi lần tham gia', 5) },
      { label: '3. Tìm hiểu học thuật trực tuyến cấp Khoa/Phân hiệu/Lớp/Chi Đoàn/Chi Hội', options: once('4.3', 'Mỗi lần tham gia', 3) },
      { label: '4. Cổ vũ, cổ động cuộc thi học thuật, NCKH, ý tưởng sáng tạo, khởi nghiệp', options: once('4.4', 'Mỗi lần tham gia', 5) },
      { label: '5. Tham gia tổ chức hoạt động học thuật từ cấp Khoa/Phân hiệu (từ hoàn thành nhiệm vụ)', options: once('4.5', 'Mỗi lần tham gia', 10) },
      { label: '6. Thành viên CLB chuyên môn học thuật do Khoa/Phân hiệu thành lập (đánh giá từng học kỳ)', options: tasks('4.6', [20, 15, 10]) },
      { label: '7. Khóa học ngoại khóa được xét hoàn thành', options: once('4.7', 'Theo văn bản được phê duyệt (tự nhập)', DRL_SECTION_MAX, true) },
    ],
  },
  {
    name: 'Chính trị xã hội văn hóa thể thao',
    article: 'Điều 6',
    items: [
      { label: '1. Thi văn hóa, văn nghệ, thể thao, hoạt động phong trào', options: [
        { code: '6.1a', label: 'Cấp Lớp/Chi Đoàn/Chi Hội/Khoa/Phân hiệu', points: 10 },
        { code: '6.1b', label: 'Cấp Trường', points: 15 },
        { code: '6.1c', label: 'Cấp Thành trở lên', points: 20 },
      ] },
      { label: '2. Giao lưu văn hóa quốc tế, lễ hội/tuần lễ văn hóa, tìm hiểu văn hóa các nước', options: once('6.2', 'Mỗi lần tham gia', 5) },
      { label: '3. Giáo dục truyền thống (địa chỉ đỏ, bảo tàng, di tích lịch sử…)', options: once('6.3', 'Mỗi lần tham gia', 5) },
      { label: '4. Tìm hiểu VHVN, TDTT, phong trào hình thức trực tuyến', options: once('6.4', 'Mỗi lần tham gia', 3) },
      { label: '5. Cổ vũ, cổ động hoạt động văn nghệ, thể dục thể thao', options: once('6.5', 'Mỗi lần tham gia', 5) },
      { label: '6. Sinh hoạt chính trị, xã hội, phòng chống tệ nạn xã hội', options: once('6.6', 'Mỗi lần tham gia', 5) },
      { label: '7. Tham gia tổ chức hoạt động VHVN, TDTT, phong trào từ cấp Khoa/Phân hiệu (từ hoàn thành nhiệm vụ)', options: once('6.7', 'Mỗi lần tham gia', 10) },
      { label: '8. Thành viên CLB/Đội/Nhóm VHVN, TDTT; đội tự quản, cờ đỏ; cộng tác viên (đánh giá từng học kỳ)', options: tasks('6.8', [20, 15, 10]) },
    ],
  },
  {
    name: 'Cộng đồng tình nguyện',
    article: 'Điều 7',
    items: [
      { label: '1. Tiếp sức mùa thi, Xuân Tình nguyện, Mùa hè xanh và các chiến dịch do Trường/Khoa tổ chức', options: tasks('7.1', [20, 15, 10]) },
      { label: '2. Tham gia tổ chức hoạt động tình nguyện, vì cộng đồng từ cấp Khoa/Phân hiệu (từ hoàn thành nhiệm vụ)', options: once('7.2', 'Mỗi lần tham gia', 10) },
      { label: '3. Tuyên truyền chủ trương của Đảng, chính sách pháp luật của Nhà nước', options: once('7.3', 'Mỗi lần tham gia', 5) },
      { label: '4. Hiến máu tình nguyện, hiến tặng tóc cho bệnh nhân ung thư', options: once('7.4', 'Mỗi lần tham gia', 10) },
      { label: '5. Chủ nhật xanh, Thứ 7 tình nguyện; tình nguyện bên ngoài trường có minh chứng', options: once('7.5', 'Mỗi lần tham gia', 7) },
      { label: '6. Tiếp sức đến trường, vì đàn em thân yêu, biên giới biển đảo; ủng hộ, giúp đỡ cộng đồng', options: once('7.6', 'Mỗi lần tham gia', 3) },
      { label: '7. Kết nối, chia sẻ cơ hội học tập cho học sinh, lưu học sinh', options: once('7.7', 'Mỗi lần tham gia', 7) },
    ],
  },
  {
    name: 'Tiên phong gương mẫu',
    article: 'Điều 8',
    items: [
      { label: '1. Lớp trưởng, BT/PBT Chi đoàn, Chi hội trưởng/phó, BCH Đoàn/Hội Trường, Khoa/Phân hiệu', options: tasks('8.1', [20, 15, 12]) },
      { label: '2. Tổ trưởng, Ủy viên BCH Chi Đoàn/Hội', options: tasks('8.2', [15, 12, 10]) },
      { label: '3. Ban điều hành/Ban chủ nhiệm CLB/Đội/Nhóm; Ban liên lạc Lưu học sinh', options: tasks('8.3', [20, 15, 10]) },
      { label: '5. Có nhiều đóng góp cho sự phát triển của Khoa/Phân hiệu/Phòng/Ban/Trung tâm/Viện', options: once('8.5', 'Do đơn vị đánh giá (tự nhập)', DRL_SECTION_MAX, true) },
    ],
  },
  {
    name: 'Điểm thưởng',
    article: 'Điều 9',
    items: [
      { label: '1. Giấy khen NCKH/cuộc thi chuyên môn cấp Khoa/Phân hiệu', options: prizes('9.1', [7, 6, 5, 4]) },
      { label: '2. Giấy khen NCKH/cuộc thi chuyên môn cấp Trường', options: prizes('9.2', [10, 9, 8, 7]) },
      { label: '3. Giấy khen NCKH/cuộc thi chuyên môn cấp Thành', options: prizes('9.3', [15, 14, 13, 12]) },
      { label: '4. Giấy khen NCKH/cuộc thi chuyên môn cấp Bộ', options: prizes('9.4', [20, 19, 18, 17]) },
      { label: '5. Thành tích VHVN, TDTT cấp Khoa/Phân hiệu', options: prizes('9.5', [7, 6, 5, 4]) },
      { label: '6. Thành tích VHVN, TDTT cấp Trường', options: prizes('9.6', [10, 9, 8, 7]) },
      { label: '7. Thành tích VHVN, TDTT cấp Thành', options: prizes('9.7', [15, 14, 13, 12]) },
      { label: '8. Thành tích VHVN, TDTT cấp Toàn quốc', options: prizes('9.8', [18, 17, 16, 15]) },
      { label: '9. Thành tích VHVN, TDTT cấp Quốc tế', options: prizes('9.9', [20, 19, 18, 17]) },
      { label: '10. Giấy khen đóng góp tích cực cho Trường, công tác xã hội, cộng đồng, tình nguyện', options: [
        { code: '9.10a', label: 'Cấp Trường', points: 10 },
        { code: '9.10b', label: 'Cấp Tỉnh, Thành, Ngành', points: 15 },
        { code: '9.10c', label: 'Cấp Bộ; Trung ương Đoàn, Hội hoặc tương đương', points: 18 },
        { code: '9.10d', label: 'Bằng khen Chính phủ', points: 20 },
      ] },
    ],
  },
]

// Nhãn ngắn cho sinh viên: được cộng bao nhiêu điểm và vào mục nào.
export function drlPointsLabel(points?: number, category?: string | null, ruleCode?: string | null) {
  const found = findDrlOption(ruleCode)
  const section = found?.section ?? DRL_SECTIONS.find(s => s.name === category)
  if (!points) return null
  return { points: `+${points} điểm`, section: section ? `${section.article}. ${section.name}` : category ?? '' }
}

export function findDrlOption(code?: string | null) {
  if (!code) return null
  for (const section of DRL_SECTIONS)
    for (const item of section.items)
      for (const option of item.options) if (option.code === code) return { section, item, option }
  return null
}

// --- Bảng mô tả quy chế dùng cho trang chi tiết tiêu chí (giữ nguyên từ bản trước) ---

export type DrlRuleRow = {
  criterion: string
  points: string
}

export const drlRegulationDetails: Record<string, DrlRuleRow[]> = {
  'Học tập & Học thuật': [
    { criterion: 'Tham gia thi học thuật, nghiên cứu khoa học, ý tưởng sáng tạo hoặc khởi nghiệp cấp Lớp/Chi đoàn/Chi hội/Khoa/Phân hiệu', points: '10 điểm/lần' },
    { criterion: 'Tham gia thi học thuật, nghiên cứu khoa học, ý tưởng sáng tạo hoặc khởi nghiệp cấp Trường', points: '15 điểm/lần' },
    { criterion: 'Tham gia thi học thuật, nghiên cứu khoa học, ý tưởng sáng tạo hoặc khởi nghiệp cấp Thành trở lên', points: '20 điểm/lần' },
    { criterion: 'Tham gia hội thảo khoa học, buổi sinh hoạt chuyên đề, chia sẻ định hướng nghề nghiệp hoặc tham quan thực tế nghề nghiệp', points: '5 điểm/lần' },
    { criterion: 'Tham gia hoạt động tìm hiểu học thuật trực tuyến cấp Khoa/Phân hiệu/Lớp/Chi đoàn/Chi hội', points: '3 điểm/lần' },
    { criterion: 'Cổ vũ hoặc cổ động cuộc thi học thuật, nghiên cứu khoa học và khởi nghiệp', points: '5 điểm/lần' },
    { criterion: 'Tổ chức hoạt động học thuật từ cấp Khoa/Phân hiệu trở lên và hoàn thành nhiệm vụ', points: '10 điểm/lần' },
    { criterion: 'Thành viên câu lạc bộ chuyên môn hoàn thành xuất sắc/tốt/nhiệm vụ', points: '20/15/10 điểm' },
  ],
  'Nội quy quy chế': [
    { criterion: 'Sinh viên không vi phạm nội quy, quy định của Trường và pháp luật Nhà nước', points: '20 điểm' },
    { criterion: 'Vi phạm bị nhắc nhở/phê bình/nghiêm khắc phê bình', points: '-5/-7/-9 điểm/lần' },
    { criterion: 'Vi phạm bị khiển trách/cảnh cáo/cảnh cáo lần 2', points: '-12/-16/-20 điểm/lần' },
    { criterion: 'Không chấp hành điều động, phân công, thông báo hoặc bỏ hoạt động đã đăng ký', points: '-5 điểm/lần' },
  ],
  'Chính trị xã hội văn hóa thể thao': [
    { criterion: 'Tham gia thi văn hóa, văn nghệ, thể thao hoặc hoạt động phong trào cấp Lớp/Chi đoàn/Chi hội/Khoa/Phân hiệu', points: '10 điểm/lần' },
    { criterion: 'Tham gia thi văn hóa, văn nghệ, thể thao hoặc hoạt động phong trào cấp Trường', points: '15 điểm/lần' },
    { criterion: 'Tham gia thi văn hóa, văn nghệ, thể thao hoặc hoạt động phong trào cấp Thành trở lên', points: '20 điểm/lần' },
    { criterion: 'Tham gia giao lưu văn hóa hoặc lễ hội văn hóa do đơn vị tổ chức', points: '5 điểm/lần' },
    { criterion: 'Tham gia giáo dục truyền thống tại địa chỉ đỏ, bảo tàng, nhà tưởng niệm hoặc di tích lịch sử', points: '5 điểm/lần' },
    { criterion: 'Tham gia sinh hoạt chính trị, xã hội, phòng chống tệ nạn xã hội', points: '5 điểm/lần' },
    { criterion: 'Tham gia tổ chức hoạt động văn nghệ, thể dục thể thao hoặc phong trào', points: '10 điểm/lần' },
  ],
  'Cộng đồng tình nguyện': [
    { criterion: 'Tham gia chương trình Tiếp sức mùa thi, Xuân tình nguyện, Mùa hè xanh và các chiến dịch tương tự', points: '10/15/20 điểm' },
    { criterion: 'Tổ chức hoạt động tình nguyện hoặc hoạt động cộng đồng từ cấp Khoa/Phân hiệu trở lên', points: '10 điểm/lần' },
    { criterion: 'Tuyên truyền chủ trương của Đảng và chính sách, pháp luật của Nhà nước', points: '5 điểm/lần' },
    { criterion: 'Hiến máu tình nguyện hoặc hiến tặng tóc cho bệnh nhân ung thư', points: '10 điểm/lần' },
    { criterion: 'Tham gia Chủ nhật xanh, thứ Bảy tình nguyện hoặc hoạt động cộng đồng tương tự', points: '7 điểm/lần' },
    { criterion: 'Tham gia hoạt động tình nguyện bên ngoài Trường hoặc hỗ trợ cộng đồng', points: '3 điểm/lần' },
    { criterion: 'Tham gia hoạt động kết nối cơ hội học tập cho học sinh, lưu học sinh', points: '7 điểm/lần' },
  ],
  'Tiên phong gương mẫu': [
    { criterion: 'Lớp trưởng, Bí thư/Phó bí thư Chi đoàn, BCH Đoàn/Hội hoàn thành xuất sắc/tốt/nhiệm vụ', points: '20/15/12 điểm' },
    { criterion: 'Tổ trưởng hoặc Ủy viên BCH Chi đoàn/Chi hội hoàn thành xuất sắc/tốt/nhiệm vụ', points: '15/12/10 điểm' },
    { criterion: 'Ban điều hành hoặc Ban chủ nhiệm CLB/Đội/Nhóm hoàn thành xuất sắc/tốt/nhiệm vụ', points: '20/15/10 điểm' },
    { criterion: 'Chủ động tham gia hoạt động chung của Lớp/Khoa/Trường: 7-10/11-14/15+ hoạt động', points: '8/10/12 điểm' },
  ],
  'Điểm thưởng': [
    { criterion: 'Giấy khen NCKH/cuộc thi chuyên môn cấp Khoa/Phân hiệu', points: 'Giải nhất 7, nhì 6, ba 5, khuyến khích 4' },
    { criterion: 'Giấy khen NCKH/cuộc thi chuyên môn cấp Trường', points: 'Giải nhất 10, nhì 9, ba 8, khuyến khích 7' },
    { criterion: 'Giấy khen NCKH/cuộc thi chuyên môn cấp Thành', points: 'Giải nhất 15, nhì 14, ba 13, khuyến khích 12' },
    { criterion: 'Giấy khen NCKH/cuộc thi chuyên môn cấp Bộ', points: 'Giải nhất 20, nhì 19, ba 18, khuyến khích 17' },
    { criterion: 'Thành tích văn hóa văn nghệ, TDTT cấp Trường', points: 'Giải nhất 10, nhì 9, ba 8, khuyến khích 7' },
    { criterion: 'Thành tích văn hóa văn nghệ, TDTT cấp Thành/toàn quốc', points: 'Tối đa 15/18 điểm' },
    { criterion: 'Giấy khen đóng góp cho Trường và hoạt động cộng đồng, cấp Trường/Tỉnh-Bộ', points: '10/15/18/20 điểm' },
  ],
}

export function getDrlRuleRows(group: string, name: string) {
  return drlRegulationDetails[group] ?? drlRegulationDetails[name] ?? []
}
