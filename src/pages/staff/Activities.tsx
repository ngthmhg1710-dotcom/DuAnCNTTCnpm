import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { activities } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

export default function StaffActivities() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showPublish, setShowPublish] = useState<number | null>(null)
  const [toast, setToast] = useState('')

  const filtered = activities.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý hoạt động</h1>
          <p className="text-slate-500 text-sm mt-1">{activities.length} hoạt động · HK1 2024-2025</p>
        </div>
        <button onClick={() => navigate('/staff/activities/create')} className="btn-primary">+ Tạo hoạt động</button>
      </div>

      <div className="card mb-5 p-4 flex gap-3">
        <input className="input max-w-xs" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select"><option>Tất cả loại</option><option>Học thuật</option><option>Tình nguyện</option></select>
        <select className="select"><option>Tất cả trạng thái</option><option>Đang mở</option><option>Đã kết thúc</option></select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">Tên hoạt động</th>
              <th className="text-left px-4 py-3">Loại</th>
              <th className="text-left px-4 py-3">Đơn vị</th>
              <th className="text-left px-4 py-3">Thời gian</th>
              <th className="text-left px-4 py-3">Đăng ký</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(a => (
              <tr key={a.id} className="table-row">
                <td className="px-4 py-3 font-medium text-slate-800 max-w-xs"><div className="truncate">{a.name}</div></td>
                <td className="px-4 py-3 text-slate-600 text-xs">{a.type}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{a.unit}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{a.startDate}</td>
                <td className="px-4 py-3 text-slate-600">{a.registered}/{a.capacity}</td>
                <td className="px-4 py-3">{statusBadge(a.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => navigate(`/staff/activities/${a.id}`)} className="btn-secondary text-xs py-1 px-2">Xem</button>
                    <button onClick={() => navigate(`/staff/activities/${a.id}/edit`)} className="btn-secondary text-xs py-1 px-2">Sửa</button>
                    {a.status !== 'Đã kết thúc' && (
                      <button onClick={() => setShowPublish(a.id)} className="btn-primary text-xs py-1 px-2">Công bố</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPublish !== null && (
        <Modal title="Xác nhận công bố hoạt động" onClose={() => setShowPublish(null)}>
          <p className="text-slate-600 text-sm mb-4">
            Công bố hoạt động <strong>"{activities.find(a => a.id === showPublish)?.name}"</strong> cho sinh viên đăng ký?
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowPublish(null)} className="btn-secondary">Hủy</button>
            <button onClick={() => { setShowPublish(null); setToast('Đã công bố hoạt động!') }} className="btn-primary">Xác nhận công bố</button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
