import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  HourglassOutlined,
  TrophyOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { statusBadge } from '../../components/ui/Badge'
import { getCurrentUser, CurrentUser } from '../../lib/api'

const stats = [
  { label: 'Đã đăng ký', value: 5, icon: <CalendarOutlined />, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
  { label: 'Đã tham gia', value: 8, icon: <CheckCircleOutlined />, color: 'bg-green-50 text-green-600', border: 'border-green-100' },
  { label: 'Chờ xác minh', value: 2, icon: <HourglassOutlined />, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
  { label: 'Tiêu chí đạt', value: '3/4', icon: <TrophyOutlined />, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
]

const upcoming = [
  { id: 4, name: 'Hiến máu nhân đạo lần 3 năm 2024', time: '05/09/2024 – 07:30', location: 'Sân A - TDTU', type: 'Tình nguyện', status: 'Đã đăng ký' },
  { id: 5, name: 'Seminar AI & Machine Learning', time: '01/10/2024 – 09:00', location: 'Hội trường B', type: 'Học thuật', status: 'Đang mở' },
  { id: 7, name: 'Workshop Thiết kế UI/UX', time: '08/11/2024 – 08:00', location: 'Phòng 5.01 – Tòa A', type: 'Học thuật', status: 'Đang mở' },
]

const criteriaProgress = [
  { name: 'Tình nguyện & Cộng đồng', current: 2, required: 2, pct: 100 },
  { name: 'Học thuật & Chuyên môn', current: 2, required: 3, pct: 67 },
  { name: 'Văn hóa & Thể thao', current: 1, required: 1, pct: 100 },
  { name: 'Kỹ năng & Ngoại khóa', current: 0, required: 1, pct: 0 },
]

const attention = [
  { icon: <WarningOutlined className="text-amber-600 mt-0.5" />, text: 'Còn thiếu 1 hoạt động nhóm Kỹ năng & Ngoại khóa', level: 'warning' },
  { icon: <HourglassOutlined className="text-blue-600 mt-0.5" />, text: '2 khai báo đang chờ xác minh', level: 'info' },
  { icon: <CalendarOutlined className="text-blue-600 mt-0.5" />, text: 'Học kỳ HK1 2024-2025 kết thúc vào 31/01/2025', level: 'info' },
]

const recommended = [
  { id: 6, name: 'Chào đón tân sinh viên K2024', type: 'Văn hóa – Văn nghệ', time: '15/10/2024', unit: 'Đoàn Trường TDTU' },
  { id: 8, name: 'Hội trại sinh viên CNTT 2024', type: 'Văn hóa – Văn nghệ', time: '20/12/2024', unit: 'Đoàn Khoa CNTT' },
]

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    getCurrentUser().then(u => setUser(u)).catch(() => {})
  }, [])

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Xin chào, {user?.name || 'Sinh viên'}!</h1>
        <p className="text-slate-500 text-sm mt-1">Học kỳ hiện tại: <span className="font-semibold text-slate-700">HK1 2024-2025</span> · Email: {user?.email || user?.username || 'Google Account'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className={`stat-card flex items-center gap-3 border ${s.border}`}>
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-lg shrink-0`}>{s.icon}</div>
            <div className="min-w-0">
              <div className="text-xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500 font-medium leading-tight">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Upcoming activities */}
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Hoạt động sắp diễn ra</h2>
              <button onClick={() => navigate('/student/activities')} className="text-blue-600 text-sm hover:underline font-medium">Xem tất cả →</button>
            </div>
            <div className="divide-y divide-slate-50">
              {upcoming.map(act => (
                <div key={act.id} className="px-4 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 hover:bg-slate-50/50">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-800 line-clamp-2">{act.name}</div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1"><ClockCircleOutlined /> {act.time}</span>
                      <span className="flex items-center gap-1"><EnvironmentOutlined /> {act.location}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <span className="badge bg-slate-100 text-slate-500 border border-slate-200">{act.type}</span>
                      {statusBadge(act.status)}
                    </div>
                  </div>
                  <button onClick={() => navigate(`/student/activities/${act.id}`)} className="btn-secondary text-xs shrink-0 self-start">Xem chi tiết</button>
                </div>
              ))}
            </div>
          </div>

          {/* Attention */}
          <div className="card">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Cần chú ý</h2>
            </div>
            <div className="p-5 space-y-3">
              {attention.map((a, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg text-sm ${a.level === 'warning' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}`}>
                  <span>{a.icon}</span><span>{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Criteria progress */}
          <div className="card">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Tiến độ tiêu chí</h2>
            </div>
            <div className="p-5 space-y-4">
              {criteriaProgress.map(c => (
                <div key={c.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium truncate pr-2">{c.name}</span>
                    <span className={`font-semibold shrink-0 ${c.pct === 100 ? 'text-green-600' : c.pct > 0 ? 'text-amber-600' : 'text-red-500'}`}>{c.current}/{c.required}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${c.pct}%`, background: c.pct === 100 ? '#22c55e' : c.pct > 0 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                </div>
              ))}
              <button onClick={() => navigate('/student/criteria')} className="btn-secondary w-full justify-center text-xs mt-2">Xem chi tiết →</button>
            </div>
          </div>

          {/* Recommended */}
          <div className="card">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Hoạt động đề xuất</h2>
            </div>
            <div className="p-5 space-y-3">
              {recommended.map(r => (
                <div key={r.id} className="bg-slate-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-slate-800 leading-tight">{r.name}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><ClockCircleOutlined /> {r.type} · {r.time}</div>
                  <button onClick={() => navigate(`/student/activities/${r.id}`)} className="btn-primary text-xs mt-2 py-1">Xem hoạt động</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
