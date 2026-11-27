import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { getNotifications, getSentNotifications, markAllNotificationsRead, markNotificationRead, sendNotification, type NotificationItem, type SentNotification } from '../../lib/api'

const empty = { title: '', message: '', kind: 'all', value: '' }

export default function StaffNotifications() {
  const [items, setItems] = useState<SentNotification[]>([])
  const [inbox, setInbox] = useState<NotificationItem[]>([])
  const [tab, setTab] = useState<'inbox' | 'sent'>('inbox')
  const [form, setForm] = useState<typeof empty | null>(null)
  const [toast, setToast] = useState('')

  const load = () => getSentNotifications().then(setItems).catch(() => setToast('Không tải được danh sách thông báo.'))
  useEffect(() => { load(); getNotifications().then(setInbox).catch(() => {}) }, [])
  const navigate = useNavigate()
  const unread = inbox.filter(n => !n.read).length
  const markRead = (id: number) => { markNotificationRead(id).catch(() => {}); setInbox(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n))) }
  const markAllRead = () => { markAllNotificationsRead().catch(() => {}); setInbox(prev => prev.map(n => ({ ...n, read: true }))) }

  const send = async () => {
    if (!form) return
    if (!form.title.trim() || !form.message.trim()) return setToast('Vui lòng nhập tiêu đề và nội dung.')
    if (form.kind !== 'all' && !form.value.trim()) return setToast('Vui lòng nhập lớp hoặc khóa.')
    try {
      const { sent } = await sendNotification({
        title: form.title,
        message: form.message,
        className: form.kind === 'class' ? form.value.trim() : undefined,
        cohort: form.kind === 'cohort' ? form.value.trim() : undefined,
      })
      setForm(null)
      setToast(`Đã gửi cho ${sent} sinh viên!`)
      load()
    } catch (e: any) {
      setToast(e?.response?.data?.message?.toString() || 'Gửi thất bại.')
    }
  }

  return (
    <div className="page-container max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Thông báo</h1>
        <button onClick={() => setForm(empty)} className="btn-primary">+ Tạo thông báo</button>
      </div>

      <div className="flex border-b border-slate-200 mb-4">
        {([['inbox', `Hộp thư${unread ? ` (${unread})` : ''}`], ['sent', 'Đã gửi']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-5 py-2.5 text-sm font-medium transition-colors ${tab === k ? 'tab-active' : 'text-slate-500 hover:text-slate-700'}`}>{label}</button>
        ))}
      </div>

      {tab === 'inbox' && (
        <div className="card divide-y divide-slate-50">
          {unread > 0 && (
            <div className="px-5 py-2 text-right"><button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Đánh dấu đã đọc tất cả</button></div>
          )}
          {inbox.map(n => (
            <button key={n.id} onClick={() => { if (!n.read) markRead(n.id); if (n.link) navigate(n.link) }} className="w-full text-left px-5 py-4 hover:bg-slate-50 flex gap-3">
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-blue-500'}`} aria-label={n.read ? 'Đã đọc' : 'Chưa đọc'} />
              <span className="min-w-0">
                <span className={`block text-sm text-slate-800 ${n.read ? '' : 'font-semibold'}`}>{n.title}</span>
                <span className="block text-sm text-slate-500 mt-1">{n.message}</span>
                <span className="flex gap-3 mt-2 items-center">
                  <span className="badge bg-slate-100 text-slate-500 border border-slate-200 text-xs">{n.type}</span>
                  <span className="text-xs text-slate-400">{n.time}</span>
                  {n.link && <span className="text-xs text-blue-600 font-medium">Xem chi tiết →</span>}
                </span>
              </span>
            </button>
          ))}
          {inbox.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-500">Chưa có thông báo nào gửi đến bạn</div>}
        </div>
      )}

      {tab === 'sent' && <div className="card divide-y divide-slate-50">
        {items.map(n => (
          <div key={n.id} className="px-5 py-4">
            <div className="text-sm font-semibold text-slate-800">{n.title}</div>
            <p className="text-sm text-slate-500 mt-1">{n.message}</p>
            <div className="flex gap-4 mt-2">
              <span className="badge bg-slate-100 text-slate-500 border border-slate-200 text-xs">{n.recipients} người nhận</span>
              <span className="text-xs text-slate-400">{n.time}</span>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-500">Chưa gửi thông báo nào</div>}
      </div>}

      {form && (
        <Modal title="Tạo thông báo mới" onClose={() => setForm(null)} width="max-w-lg">
          <div className="space-y-3">
            <div>
              <label htmlFor="notifications-f1" className="block text-sm font-medium text-slate-700 mb-1.5">Tiêu đề</label>
              <input id="notifications-f1" className="input" placeholder="Tiêu đề thông báo" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label htmlFor="notifications-f2" className="block text-sm font-medium text-slate-700 mb-1.5">Nội dung</label>
              <textarea id="notifications-f2" className="input min-h-[80px] resize-none" placeholder="Nội dung thông báo..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>
            <div>
              <label htmlFor="notifications-f3" className="block text-sm font-medium text-slate-700 mb-1.5">Đối tượng</label>
              <div className="flex gap-2">
                <select id="notifications-f3" className="select w-full" value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value, value: '' })}>
                  <option value="all">Tất cả sinh viên</option>
                  <option value="class">Theo lớp</option>
                  <option value="cohort">Theo khóa</option>
                </select>
                {form.kind !== 'all' && (
                  <input className="input" aria-label="Lớp hoặc khóa" placeholder={form.kind === 'class' ? 'TH21A' : '2021'} value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setForm(null)} className="btn-secondary">Hủy</button>
              <button onClick={send} className="btn-primary">Gửi thông báo</button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
