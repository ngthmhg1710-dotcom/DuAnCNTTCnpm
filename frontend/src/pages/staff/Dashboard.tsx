import { useNavigate } from 'react-router-dom'
import {
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  HourglassOutlined,
  WarningOutlined,
  FileTextOutlined,
  EditOutlined,
  SyncOutlined
} from '@ant-design/icons'

const stats = [
  { label: 'Tổng sinh viên', value: '1,247', icon: <TeamOutlined />, color: 'bg-blue-50 text-blue-600' },
  { label: 'Tổng hoạt động', value: '38', icon: <CalendarOutlined />, color: 'bg-purple-50 text-purple-600' },
  { label: 'Lượt tham gia', value: '4,821', icon: <CheckCircleOutlined />, color: 'bg-green-50 text-green-600' },
  { label: 'Tỷ lệ tham gia', value: '73%', icon: <BarChartOutlined />, color: 'bg-amber-50 text-amber-600' },
  { label: 'Chờ xác minh', value: '12', icon: <HourglassOutlined />, color: 'bg-orange-50 text-orange-600' },
  { label: 'Cần quan tâm', value: '28', icon: <WarningOutlined />, color: 'bg-red-50 text-red-600' },
]

const tasks = [
  { title: 'Khai báo chờ xác minh', count: 12, desc: 'Cần xử lý trong hôm nay', color: 'border-orange-200 bg-orange-50', icon: <FileTextOutlined className="text-orange-600" />, route: '/staff/verifications' },
  { title: 'Yêu cầu bổ sung', count: 3, desc: 'Đang chờ phản hồi từ sinh viên', color: 'border-amber-200 bg-amber-50', icon: <EditOutlined className="text-amber-600" />, route: '/staff/verifications' },
  { title: 'Sinh viên cần quan tâm', count: 28, desc: 'Tiến độ hoạt động thấp', color: 'border-red-200 bg-red-50', icon: <WarningOutlined className="text-red-600" />, route: '/staff/attention-students' },
  { title: 'Đồng bộ lỗi', count: 6, desc: 'Lỗi từ hệ thống CTSV', color: 'border-purple-200 bg-purple-50', icon: <SyncOutlined className="text-purple-600" />, route: '/staff/verifications' },
]

const BarChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const max = Math.max(...data.map(d => d.value))
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map(d => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div className="text-xs text-slate-500">{d.value}</div>
          <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(d.value / max) * 80}px` }} />
          <div className="text-xs text-slate-400">{d.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function StaffDashboard() {
  const navigate = useNavigate()
  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan – Cán bộ CTSV</h1>
        <p className="text-slate-500 text-sm mt-1">Học kỳ: <strong>HK1 2024-2025</strong> · Khoa Công nghệ Thông tin</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center text-lg mb-2`}>{s.icon}</div>
            <div className="text-lg sm:text-xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Task cards */}
      <div className="mb-6">
        <h2 className="font-semibold text-slate-700 mb-3">Công việc cần xử lý</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tasks.map(t => (
            <div key={t.title} onClick={() => navigate(t.route)}
              className={`card p-4 border ${t.color} cursor-pointer hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between">
                <div className="text-2xl">{t.icon}</div>
                <div className="text-2xl font-bold text-slate-800">{t.count}</div>
              </div>
              <div className="font-semibold text-slate-700 text-sm mt-2">{t.title}</div>
              <div className="text-xs text-slate-500 mt-1">{t.desc}</div>
              <div className="text-blue-600 text-xs mt-2 font-medium">Xem ngay →</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="font-semibold text-slate-700 text-sm mb-4">Hoạt động theo học kỳ</div>
          <BarChart data={[{ label: 'HK2-22', value: 8 }, { label: 'HK1-23', value: 12 }, { label: 'HK2-23', value: 10 }, { label: 'HK1-24', value: 8 }]} />
        </div>
        <div className="card p-5">
          <div className="font-semibold text-slate-700 text-sm mb-4">Sinh viên tham gia theo lớp</div>
          <div className="space-y-2">
            {[['TH21A', 45, 48], ['TH21B', 38, 52], ['TH21C', 51, 55], ['TH22A', 29, 62]].map(([cls, v, t]) => (
              <div key={cls as string}>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-600">{cls}</span><span className="text-slate-500">{v}/{t}</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.round((v as number / (t as number)) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <div className="font-semibold text-slate-700 text-sm mb-4">Hoạt động theo loại</div>
          <div className="space-y-2">
            {[['Học thuật', 15, '#3b82f6'], ['Tình nguyện', 12, '#22c55e'], ['Văn hóa', 7, '#f59e0b'], ['Ngoại khóa', 4, '#a855f7']].map(([n, v, c]) => (
              <div key={n as string} className="flex items-center gap-3 text-sm">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: c as string }} />
                <span className="text-slate-600 flex-1">{n}</span>
                <span className="font-semibold text-slate-700">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
