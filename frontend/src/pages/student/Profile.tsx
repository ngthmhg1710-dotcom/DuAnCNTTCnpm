import { useState, useEffect } from 'react'
import { getCurrentUser, CurrentUser } from '../../lib/api'

export default function StudentProfile() {
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    getCurrentUser().then(u => setUser(u)).catch(() => {})
  }, [])

  const getInitials = (name?: string) => {
    if (!name) return 'SV'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <div className="page-container max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Hồ sơ người dùng</h1>

      <div className="card p-6 mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-md shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">{user?.name || 'Đang tải...'}</div>
            <div className="text-slate-500 text-sm mt-0.5 truncate">{user?.username || 'user'} · {user?.role || 'STUDENT'}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="badge bg-green-50 text-green-700 border border-green-200">Đã xác thực Google</span>
              <span className="badge bg-blue-50 text-blue-700 border border-blue-200">HK1 2024-2025</span>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            ['Tài khoản (Username)', user?.username || 'N/A'],
            ['Họ và tên Google', user?.name || 'N/A'],
            ['Email chính thức', user?.email || 'N/A'],
            ['Quyền hệ thống', user?.role || 'N/A'],
            ['Khoa / Đơn vị', 'Công nghệ Thông tin'],
            ['Trạng thái tài khoản', 'Hoạt động (Active)'],
            ['Học kỳ hiện tại', 'HK1 2024-2025'],
            ['Phương thức xác thực', 'Google OAuth 2.0 / SSO'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-slate-500 text-xs font-medium">{k}</dt>
              <dd className="text-slate-800 font-semibold mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
