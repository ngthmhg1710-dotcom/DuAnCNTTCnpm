import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  AuditOutlined,
  ScheduleOutlined,
  BarChartOutlined,
  LineChartOutlined,
  FileDoneOutlined,
  WarningOutlined,
  BulbOutlined,
  BellOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { getCurrentUser, logout, CurrentUser } from '../../lib/api'

const navItems = [
  { to: '/staff/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { to: '/staff/students', icon: <TeamOutlined />, label: 'Sinh viên' },
  { to: '/staff/activities', icon: <CalendarOutlined />, label: 'Hoạt động' },
  { to: '/staff/participations', icon: <CheckSquareOutlined />, label: 'Tham gia' },
  { to: '/staff/verifications', icon: <AuditOutlined />, label: 'Xác minh' },
  { to: '/staff/semesters', icon: <ScheduleOutlined />, label: 'Học kỳ' },
  { to: '/staff/criteria', icon: <BarChartOutlined />, label: 'Tiêu chí' },
  { to: '/staff/analytics', icon: <LineChartOutlined />, label: 'Thống kê' },
  { to: '/staff/reports', icon: <FileDoneOutlined />, label: 'Báo cáo' },
  { to: '/staff/attention-students', icon: <WarningOutlined />, label: 'Cần chú ý' },
  { to: '/staff/recommendations', icon: <BulbOutlined />, label: 'Gợi ý AI' },
  { to: '/staff/notifications', icon: <BellOutlined />, label: 'Thông báo' },
]

export default function StaffLayout() {
  const navigate = useNavigate()
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    getCurrentUser().then(u => setUser(u)).catch(() => {})
  }, [])

  const getInitials = (name?: string) => {
    if (!name) return 'CB'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="w-56 bg-slate-900 flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-slate-700/50">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-1">TDTU – CNTT</div>
          <div className="text-white font-bold text-sm leading-tight">Quản lý Hoạt động</div>
          <div className="mt-2 px-2 py-1 bg-emerald-600/20 rounded text-emerald-400 text-xs font-semibold inline-block">Cán bộ Khoa</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span className="text-base flex items-center">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs font-semibold truncate">{user?.name || 'Đang tải...'}</div>
              <div className="text-slate-500 text-xs truncate">{user?.email || user?.username || 'Cán bộ'}</div>
            </div>
          </div>
          <button onClick={() => logout()} className="sidebar-link w-full text-left flex items-center gap-2">
            <LogoutOutlined />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
