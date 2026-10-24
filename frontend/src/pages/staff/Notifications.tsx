import { useEffect, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { getSentNotifications, sendNotification, type SentNotification } from '../../lib/api'

const empty = { title: '', message: '', kind: 'all', value: '' }

export default function StaffNotifications() {
  const [items, setItems] = useState<SentNotification[]>([])
  const [form, setForm] = useState<typeof empty | null>(null)
  const [toast, setToast] = useState('')

  const load = () => getSentNotifications().then(setItems).catch(() => setToast('Không tải được danh sách thông báo.'))
  useEffect(() => { load() }, [])

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
        <h1 className="text-2xl font-bold text-slate-800">Thông báo đã gửi</h1>
        <button onClick={() => setForm(empty)} className="btn-primary">+ Tạo thông báo</button>
      </div>

      <div className="card divide-y divide-slate-50">
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
      </div>

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
