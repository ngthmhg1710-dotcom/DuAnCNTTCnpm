import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActivities, updateActivity, deleteActivity, type Activity } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

export default function StaffActivities() {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showPublish, setShowPublish] = useState<number | null>(null)
  const [showDelete, setShowDelete] = useState<number | null>(null)
  const [toast, setToast] = useState('')

  const load = () => {
    setLoading(true)
    getActivities().then(setActivities).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = activities.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))

  const publish = async (id: number) => {
    await updateActivity(id, { published: true })
    setShowPublish(null)
    setToast('Đã công bố hoạt động!')
    load()
  }

  const remove = async (id: number) => {
    await deleteActivity(id)
    setShowDelete(null)
    setToast('Đã xóa hoạt động!')
    load()
  }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý hoạt động</h1>
          <p className="text-slate-500 text-sm mt-1">{activities.length} hoạt động</p>
        </div>
        <button onClick={() => navigate('/staff/activities/create')} className="btn-primary self-start sm:self-auto">+ Tạo hoạt động</button>
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
        <input className="input w-full sm:w-auto sm:max-w-xs" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="card p-8 text-center text-slate-400 text-sm">Đang tải...</div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {filtered.map(a => (
              <div key={a.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-slate-800 text-sm leading-snug">{a.title}</div>
                  <div className="shrink-0">{statusBadge(a.status)}</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">{a.category}</span>
                  {a.unit && <span className="badge bg-slate-100 text-slate-600 border border-slate-200">{a.unit}</span>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div><span className="text-slate-400">Thời gian:</span> <span className="font-medium text-slate-700">{new Date(a.startAt).toLocaleDateString('vi-VN')}</span></div>
                  <div><span className="text-slate-400">Số lượng:</span> <span className="font-medium text-slate-700">{a.registered}/{a.capacity ?? '—'}</span></div>
                </div>
                <div className="pt-1 flex gap-2">
                  <button onClick={() => navigate(`/staff/activities/${a.id}`)} className="btn-secondary text-xs flex-1 justify-center py-2">Xem</button>
                  <button onClick={() => navigate(`/staff/activities/${a.id}/edit`)} className="btn-secondary text-xs flex-1 justify-center py-2">Sửa</button>
                  {a.status === 'Nháp' && (
                    <button onClick={() => setShowPublish(a.id)} className="btn-primary text-xs flex-1 justify-center py-2">Công bố</button>
                  )}
                  <button onClick={() => setShowDelete(a.id)} className="btn-secondary text-xs flex-1 justify-center py-2 text-red-600 border-red-200">Xóa</button>
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
                      <td className="px-4 py-3 font-medium text-slate-800 min-w-[240px] max-w-md whitespace-normal leading-snug">
                        <div className="flex items-center gap-3">
                          {a.imageUrl ? (
                            <img src={a.imageUrl} alt={a.title} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 text-base">
                              🖼️
                            </div>
                          )}
                          <span className="font-semibold text-slate-800">{a.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{a.category}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{a.unit ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{new Date(a.startAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3 text-slate-600">{a.registered}/{a.capacity ?? '—'}</td>
                      <td className="px-4 py-3">{statusBadge(a.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => navigate(`/staff/activities/${a.id}`)} className="btn-secondary text-xs py-1 px-2">Xem</button>
                          <button onClick={() => navigate(`/staff/activities/${a.id}/edit`)} className="btn-secondary text-xs py-1 px-2">Sửa</button>
                          {a.status === 'Nháp' && (
                            <button onClick={() => setShowPublish(a.id)} className="btn-primary text-xs py-1 px-2">Công bố</button>
                          )}
                          <button onClick={() => setShowDelete(a.id)} className="btn-secondary text-xs py-1 px-2 text-red-600 border-red-200">Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-400">Không có hoạt động nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showPublish !== null && (
        <Modal title="Xác nhận công bố hoạt động" onClose={() => setShowPublish(null)}>
          <p className="text-slate-600 text-sm mb-4">
            Công bố hoạt động <strong>"{activities.find(a => a.id === showPublish)?.title}"</strong> cho sinh viên đăng ký?
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowPublish(null)} className="btn-secondary">Hủy</button>
            <button onClick={() => publish(showPublish)} className="btn-primary">Xác nhận công bố</button>
          </div>
        </Modal>
      )}

      {showDelete !== null && (
        <Modal title="Xác nhận xóa hoạt động" onClose={() => setShowDelete(null)}>
          <p className="text-slate-600 text-sm mb-4">
            Xóa vĩnh viễn hoạt động <strong>"{activities.find(a => a.id === showDelete)?.title}"</strong>? Toàn bộ lượt đăng ký/tham gia liên quan cũng sẽ bị xóa.
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowDelete(null)} className="btn-secondary">Hủy</button>
            <button onClick={() => remove(showDelete)} className="btn-danger">Xác nhận xóa</button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
