import { useEffect, useState } from 'react'
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
} from '@ant-design/icons'
import { getStaffDashboard } from '../../lib/api'

type DashboardData = {
  students: number
  activities: number
  participations: number
  participationRate: number
  pendingVerification: number
  needsMoreInfo: number
  attentionCount: number
  byCategory: { category: string; value: number }[]
}

export default function StaffDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => { getStaffDashboard().then(setData) }, [])

  const stats = [
    { label: 'Tổng sinh viên', value: data?.students ?? '—', icon: <TeamOutlined />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Tổng hoạt động', value: data?.activities ?? '—', icon: <CalendarOutlined />, color: 'bg-purple-50 text-purple-600' },
    { label: 'Lượt tham gia', value: data?.participations ?? '—', icon: <CheckCircleOutlined />, color: 'bg-green-50 text-green-600' },
    { label: 'Tỷ lệ tham gia', value: data ? `${data.participationRate}%` : '—', icon: <BarChartOutlined />, color: 'bg-amber-50 text-amber-600' },
    { label: 'Chờ xác minh', value: data?.pendingVerification ?? '—', icon: <HourglassOutlined />, color: 'bg-orange-50 text-orange-600' },
    { label: 'Cần quan tâm', value: data?.attentionCount ?? '—', icon: <WarningOutlined />, color: 'bg-red-50 text-red-600' },
  ]

  const tasks = [
    { title: 'Khai báo chờ xác minh', count: data?.pendingVerification ?? 0, desc: 'Cần tiếp nhận và xử lý', color: 'border-orange-200 bg-orange-50', icon: <FileTextOutlined className="text-orange-600" />, route: '/staff/verifications' },
    { title: 'Yêu cầu bổ sung', count: data?.needsMoreInfo ?? 0, desc: 'Đang chờ phản hồi từ sinh viên', color: 'border-amber-200 bg-amber-50', icon: <EditOutlined className="text-amber-600" />, route: '/staff/verifications' },
    { title: 'Sinh viên cần quan tâm', count: data?.attentionCount ?? 0, desc: 'Tiến độ hoạt động thấp', color: 'border-red-200 bg-red-50', icon: <WarningOutlined className="text-red-600" />, route: '/staff/attention-students' },
  ]

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan – Cán bộ CTSV</h1>
        <p className="text-slate-500 text-sm mt-1">Khoa Công nghệ Thông tin</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Category breakdown */}
      <div className="card p-5 max-w-md">
        <div className="font-semibold text-slate-700 text-sm mb-4">Hoạt động theo loại</div>
        <div className="space-y-2">
          {(data?.byCategory ?? []).map((c) => (
            <div key={c.category} className="flex items-center gap-3 text-sm">
              <span className="text-slate-600 flex-1">{c.category}</span>
              <span className="font-semibold text-slate-700">{c.value}</span>
            </div>
          ))}
          {data && data.byCategory.length === 0 && <div className="text-slate-400 text-sm">Chưa có dữ liệu</div>}
        </div>
      </div>
    </div>
  )
}
