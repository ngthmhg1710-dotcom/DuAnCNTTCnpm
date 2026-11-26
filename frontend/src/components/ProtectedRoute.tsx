import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../lib/api'

type Role = 'STUDENT' | 'STAFF' | 'ADMIN'

interface Props {
  allowedRoles: Role[]
  children: React.ReactNode
}

/**
 * Bảo vệ route dựa trên vai trò.
 * - Chưa đăng nhập → redirect về /login (kèm ?from= để quay lại sau khi đăng nhập)
 * - Đăng nhập nhưng sai vai trò → redirect về dashboard tương ứng với vai trò hiện tại
 */
export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const location = useLocation()
  const [status, setStatus] = useState<'loading' | 'allowed' | 'forbidden' | 'unauthenticated'>('loading')
  const [userRole, setUserRole] = useState<Role | null>(null)

  useEffect(() => {
    getCurrentUser()
      .then(user => {
        setUserRole(user.role)
        setStatus(allowedRoles.includes(user.role) ? 'allowed' : 'forbidden')
      })
      .catch(() => setStatus('unauthenticated'))
  }, [location.pathname])

  if (status === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-slate-500" role="status">
        Đang kiểm tra quyền truy cập...
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (status === 'forbidden') {
    const home =
      userRole === 'ADMIN' ? '/admin/dashboard' :
      userRole === 'STAFF' ? '/staff/dashboard' :
      '/student/dashboard'
    return <Navigate to={home} replace />
  }

  return <>{children}</>
}
