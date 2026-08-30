import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  DashboardOutlined,
  UsergroupAddOutlined,
  SafetyCertificateOutlined,
  FolderOutlined,
  ApiOutlined,
  SyncOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { getCurrentUser, logout, CurrentUser } from '../../lib/api'

const navItems = [
  { to: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { to: '/admin/accounts', icon: <UsergroupAddOutlined />, label: 'Tài khoản' },
  { to: '/admin/roles', icon: <SafetyCertificateOutlined />, label: 'Vai trò & Quyền' },
  { to: '/admin/categories', icon: <FolderOutlined />, label: 'Danh mục' },
  { to: '/admin/integrations', icon: <ApiOutlined />, label: 'Tích hợp API' },
  { to: '/admin/synchronization', icon: <SyncOutlined />, label: 'Đồng bộ' },
  { to: '/admin/audit-logs', icon: <UnorderedListOutlined />, label: 'Audit Log' },
  { to: '/admin/settings', icon: <SettingOutlined />, label: 'Cài đặt hệ thống' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    getCurrentUser().then(u => setUser(u)).catch(() => {})
  }, [])

  const getInitials = (name?: string) => {
    if (!name) return 'AD'
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
          <div className="mt-2 px-2 py-1 bg-purple-600/20 rounded text-purple-400 text-xs font-semibold inline-block">Admin</div>
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
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs font-semibold truncate">{user?.name || 'Đang tải...'}</div>
              <div className="text-slate-500 text-xs truncate">{user?.email || user?.username || 'Admin'}</div>
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
