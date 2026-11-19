import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
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
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { getCurrentUser, logout, CurrentUser } from '../../lib/api'

const navItems = [
  { to: '/staff/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { to: '/staff/accounts', icon: <TeamOutlined />, label: 'Tài khoản' },
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
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const currentNav = navItems.find(item => location.pathname.startsWith(item.to))

  useEffect(() => {
    getCurrentUser().then(u => setUser(u)).catch(() => {})
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const getInitials = (name?: string) => {
    if (!name) return 'CB'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  const SidebarContent = () => (
    <>
      <div className="px-5 py-5 border-b border-slate-200/80 flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
          <img src="/logo.png" alt="TDTU Logo" className="h-9 w-auto object-contain" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.12em]">TDTU – CNTT</div>
          <div className="text-slate-900 font-bold text-[15px] leading-tight mt-0.5 truncate">Quản lý hoạt động</div>
        </div>
      </div>
      <div className="px-4 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Không gian cán bộ</div>
      <nav aria-label="Menu chính" className="flex-1 px-3 pb-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="text-base flex items-center">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-slate-200/80">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-slate-900 text-xs font-semibold truncate">{user?.name || 'Đang tải...'}</div>
            <div className="text-slate-500 text-xs truncate">{user?.email || 'Cán bộ'}</div>
          </div>
        </div>
        <button onClick={() => logout()} className="sidebar-link w-full text-left flex items-center gap-2">
          <LogoutOutlined />
          <span>Đăng xuất</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="staff-portal portal-shell flex h-screen bg-slate-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:m-2 focus:px-3 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-md">Bỏ qua điều hướng</a>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-[244px] bg-white border-r border-slate-200/80 flex-col shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          aria-hidden="true" className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-900 p-2 cursor-pointer"
          aria-label="Đóng menu"
          onClick={() => setSidebarOpen(false)}
        >
          <CloseOutlined className="text-lg" />
        </button>
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="text-slate-500 hover:text-slate-900 p-2 cursor-pointer"
              aria-label="Mở menu"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            >
              <MenuOutlined className="text-xl" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="TDTU Logo" className="h-9 w-auto object-contain" />
              <div className="text-slate-900 font-bold text-sm">Quản lý Hoạt động</div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
            {getInitials(user?.name)}
          </div>
        </div>

        <header className="hidden md:flex h-[78px] px-6 lg:px-8 items-center justify-between bg-white/90 border-b border-slate-200/80 backdrop-blur-md shrink-0">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-600">Khoa Công nghệ Thông tin</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5 truncate">{currentNav?.label || 'Quản lý hoạt động'}</div>
          </div>
          <NavLink to="/staff/notifications" className="portal-profile">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              {getInitials(user?.name)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-800 max-w-[150px] truncate">{user?.name || 'Cán bộ'}</div>
              <div className="text-[10px] text-slate-500">Cán bộ Khoa</div>
            </div>
          </NavLink>
        </header>

        <main id="main-content" className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
