import { useState } from 'react'
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
  NotificationOutlined
} from '@ant-design/icons'
import { notifications } from '../../data/mock'

const renderNotificationIcon = (type: string) => {
  switch (type) {
    case 'Xác minh':
      return (
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0 border border-emerald-100/80 shadow-2xs">
          <CheckCircleOutlined />
        </div>
      )
    case 'Bổ sung':
      return (
        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shrink-0 border border-amber-100/80 shadow-2xs">
          <ExclamationCircleOutlined />
        </div>
      )
    case 'Nhắc nhở':
      return (
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0 border border-blue-100/80 shadow-2xs">
          <BellOutlined />
        </div>
      )
    case 'Hoạt động mới':
    default:
      return (
        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg shrink-0 border border-purple-100/80 shadow-2xs">
          <NotificationOutlined />
        </div>
      )
  }
}

export default function StudentNotifications() {
  const [items, setItems] = useState(notifications)
  const unread = items.filter(n => !n.read).length

  const markRead = (id: number) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })))

  return (
    <div className="page-container max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thông báo</h1>
          {unread > 0 && <p className="text-slate-500 text-sm mt-1">{unread} thông báo chưa đọc</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-xs">Đánh dấu tất cả đã đọc</button>
        )}
      </div>

      <div className="card divide-y divide-slate-50">
        {items.map(n => (
          <div key={n.id} className={`px-5 py-4 flex gap-4 items-start ${!n.read ? 'bg-blue-50/30' : ''}`}>
            {renderNotificationIcon(n.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className={`text-sm font-semibold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />}
              </div>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{n.message}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-slate-400">{n.time}</span>
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="text-xs text-blue-600 hover:underline font-medium">Đánh dấu đã đọc</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
