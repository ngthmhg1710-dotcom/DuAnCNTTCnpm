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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý hoạt động</h1>
          <p className="text-slate-500 text-sm mt-1">{activities.length} hoạt động · HK1 2024-2025</p>
        </div>
        <button onClick={() => navigate('/staff/activities/create')} className="btn-primary self-start sm:self-auto">+ Tạo hoạt động</button>
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
        <input className="input w-full sm:w-auto sm:max-w-xs" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select w-full sm:w-auto"><option>Tất cả loại</option><option>Học thuật</option><option>Tình nguyện</option></select>
        <select className="select w-full sm:w-auto"><option>Tất cả trạng thái</option><option>Đang mở</option><option>Đã kết thúc</option></select>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {filtered.map(a => (
          <div key={a.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-slate-800 text-sm leading-snug">{a.name}</div>
              <div className="shrink-0">{statusBadge(a.status)}</div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">{a.type}</span>
              <span className="badge bg-slate-100 text-slate-600 border border-slate-200">{a.unit}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div><span className="text-slate-400">Thời gian:</span> <span className="font-medium text-slate-700">{a.startDate}</span></div>
              <div><span className="text-slate-400">Số lượng:</span> <span className="font-medium text-slate-700">{a.registered}/{a.capacity}</span></div>
            </div>
            <div className="pt-1 flex gap-2">
              <button onClick={() => navigate(`/staff/activities/${a.id}`)} className="btn-secondary text-xs flex-1 justify-center py-2">Xem</button>
              <button onClick={() => navigate(`/staff/activities/${a.id}/edit`)} className="btn-secondary text-xs flex-1 justify-center py-2">Sửa</button>
              {a.status !== 'Đã kết thúc' && (
                <button onClick={() => setShowPublish(a.id)} className="btn-primary text-xs flex-1 justify-center py-2">Công bố</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-hidden">
        <div className="table-responsive-wrapper">
          <table className="w-full min-w-[750px] text-sm">
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
                  <td className="px-4 py-3 font-medium text-slate-800 min-w-[220px] max-w-md whitespace-normal leading-snug">{a.name}</td>
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
