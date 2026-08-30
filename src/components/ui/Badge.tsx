type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'

const variants: Record<Variant, string> = {
  success: 'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
  primary: 'bg-blue-600 text-white',
}

export function Badge({ label, variant = 'neutral' }: { label: string; variant?: Variant }) {
  return (
    <span className={`badge ${variants[variant]}`}>{label}</span>
  )
}

export function statusBadge(status: string) {
  const map: Record<string, Variant> = {
    'Đang mở': 'success',
    'Đã kết thúc': 'neutral',
    'Đã đăng ký': 'info',
    'Đã tham gia': 'success',
    'Vắng': 'danger',
    'Đang xác minh': 'warning',
    'Đã xác minh': 'success',
    'Nháp': 'neutral',
    'Đã gửi': 'info',
    'Đang xử lý': 'warning',
    'Cần bổ sung': 'warning',
    'Từ chối': 'danger',
    'Chờ xử lý': 'warning',
    'Kết nối': 'success',
    'Lỗi': 'danger',
    'Hoạt động': 'success',
    'Đang học': 'info',
    'Hiện tại': 'primary',
    'Đang áp dụng': 'success',
    'Thành công': 'success',
    'Lỗi một phần': 'warning',
    'Cao': 'success',
    'Trung bình': 'warning',
    'Thấp': 'danger',
  }
  const v = map[status] ?? 'neutral'
  return <Badge label={status} variant={v} />
}
