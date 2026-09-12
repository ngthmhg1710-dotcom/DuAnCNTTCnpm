import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

const notifs = [
  { id: 1, title: 'Sinh viên 521H0003 cần xác minh khai báo', type: 'Xác minh', time: '10 phút trước', read: false },
  { id: 2, title: 'Hoạt động "Hiến máu lần 3" đã đạt 80% đăng ký', type: 'Hoạt động', time: '1 giờ trước', read: false },
  { id: 3, title: 'Báo cáo HK1 2024-2025 đã được tạo tự động', type: 'Hệ thống', time: '2 ngày trước', read: true },
]

export default function StaffNotifications() {
  const [items, setItems] = useState(notifs)
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast] = useState('')

  return (
    <div className="page-container max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Thông báo</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary">+ Tạo thông báo</button>
      </div>

      <div className="card divide-y divide-slate-50">
        {items.map(n => (
          <div key={n.id} className={`px-5 py-4 flex gap-4 ${!n.read ? 'bg-blue-50/30' : ''}`}>
            <div className="flex-1">
              <div className={`text-sm font-semibold ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</div>
              <div className="flex gap-4 mt-1">
                <span className="badge bg-slate-100 text-slate-500 border border-slate-200 text-xs">{n.type}</span>
                <span className="text-xs text-slate-400">{n.time}</span>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              {!n.read && <button onClick={() => setItems(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))} className="btn-secondary text-xs py-1">Đã đọc</button>}
              <button className="btn-secondary text-xs py-1 text-red-500">Ẩn</button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <Modal title="Tạo thông báo mới" onClose={() => setShowCreate(false)} width="max-w-lg">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tiêu đề</label>
              <input className="input" placeholder="Tiêu đề thông báo" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nội dung</label>
              <textarea className="input min-h-[80px] resize-none" placeholder="Nội dung thông báo..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Đối tượng</label>
              <select className="select w-full"><option>Tất cả sinh viên</option><option>Lớp TH21A</option><option>Khóa 2021</option></select>
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setShowCreate(false)} className="btn-secondary">Hủy</button>
              <button onClick={() => { setShowCreate(false); setToast('Đã gửi thông báo!') }} className="btn-primary">Gửi thông báo</button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
