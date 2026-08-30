import { useState } from 'react'
import { notifications } from '../../data/mock'

const typeIcon: Record<string, string> = {
  'Xác minh': '✅',
  'Bổ sung': '⚠️',
  'Nhắc nhở': '🔔',
  'Hoạt động mới': '📅',
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
          <div key={n.id} className={`px-5 py-4 flex gap-4 ${!n.read ? 'bg-blue-50/30' : ''}`}>
            <div className="text-2xl shrink-0">{typeIcon[n.type] ?? '📢'}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className={`text-sm font-semibold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />}
              </div>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{n.message}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-slate-400">{n.time}</span>
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="text-xs text-blue-600 hover:underline">Đánh dấu đã đọc</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
