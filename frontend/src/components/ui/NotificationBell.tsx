import { useCallback, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BellOutlined } from '@ant-design/icons'
import { getUnreadCount } from '../../lib/api'

// Chuông thông báo kèm số chưa đọc. Tự cập nhật mỗi 60 giây, khi quay lại tab, và khi đọc/đọc tất cả.
export default function NotificationBell({ to, className = 'portal-icon-button' }: { to: string; className?: string }) {
  const [count, setCount] = useState(0)
  const refresh = useCallback(() => { getUnreadCount().then(setCount).catch(() => {}) }, [])

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, 60000)
    const onVisible = () => { if (document.visibilityState === 'visible') refresh() }
    window.addEventListener('notifications-changed', refresh)
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(timer); window.removeEventListener('notifications-changed', refresh); document.removeEventListener('visibilitychange', onVisible) }
  }, [refresh])

  return (
    <NavLink to={to} aria-label={count ? `Thông báo, ${count} chưa đọc` : 'Thông báo'} className={`${className} relative`}>
      <BellOutlined />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-[18px] text-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </NavLink>
  )
}
