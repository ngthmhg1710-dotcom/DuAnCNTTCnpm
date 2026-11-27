// Quy tắc tham gia dùng chung cho đăng ký, điểm danh, import và đồng bộ đối tác, để các nơi không lệch nhau.

// Lý do chưa điểm danh được một hoạt động (đã hủy hoặc chưa bắt đầu); null nếu điểm danh được.
export function attendanceBlocked(a: { startAt: Date; cancelled: boolean }) {
  if (a.cancelled) return 'Hoạt động đã bị hủy, không thể điểm danh.';
  if (a.startAt > new Date()) return 'Hoạt động chưa diễn ra, chưa thể điểm danh.';
  return null;
}

// Đối tượng: danh sách rỗng = mọi sinh viên; có danh sách thì sinh viên phải thuộc lớp/khóa đó. Trả về lý do nếu không thuộc.
export function audienceError(a: { targetClasses: string[]; targetCohorts: string[] }, s: { className: string | null; cohort: string | null }) {
  if (a.targetClasses.length && !a.targetClasses.includes(s.className ?? '')) return `Hoạt động chỉ dành cho lớp: ${a.targetClasses.join(', ')}.`;
  if (a.targetCohorts.length && !a.targetCohorts.includes(s.cohort ?? '')) return `Hoạt động chỉ dành cho khóa: ${a.targetCohorts.join(', ')}.`;
  return null;
}
