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
