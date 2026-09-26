import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActivities, type Activity } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'

export default function StudentActivities() {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    getActivities()
      .then(data => setActivities(data || []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = activities.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) &&
    (!filterType || a.category === filterType) &&
    (!filterStatus || a.status === filterStatus)
  )

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Danh sách hoạt động</h1>
        <p className="text-slate-500 text-sm mt-1">Tất cả hoạt động học kỳ HK1 2026-2027</p>
      </div>

      {/* Filters */}
      <div className="card mb-5 p-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <input className="input w-full sm:w-auto sm:max-w-xs" placeholder="Tìm kiếm hoạt động..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select w-full sm:w-auto" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">Tất cả loại</option>
          <option>Tình nguyện</option>
          <option>Học thuật</option>
          <option>Văn hóa – Văn nghệ</option>
        </select>
        <select className="select w-full sm:w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option>Đang mở</option>
          <option>Đã kết thúc</option>
        </select>
        <select className="select w-full sm:w-auto">
          <option>HK1 2026-2027</option>
          <option>HK2 2023-2024</option>
        </select>
        {(search || filterType || filterStatus) && (
          <button onClick={() => { setSearch(''); setFilterType(''); setFilterStatus('') }} className="btn-secondary text-xs">Xóa bộ lọc</button>
        )}
      </div>

      {loading ? (
        <div className="card p-8 text-center text-slate-400 text-sm">Đang tải...</div>
      ) : (
        <>
          {/* Card Grid View with Illustration Banner Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
            {filtered.length === 0 ? (
              <div className="col-span-full card p-8 text-center text-slate-400 text-sm">Chưa có hoạt động nào</div>
            ) : (
              filtered.map(a => (
                <div key={a.id} className="card overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
                  {/* Banner Image / Fallback Header */}
                  {a.imageUrl ? (
                    <div className="relative h-40 overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={a.imageUrl}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">{statusBadge(a.status)}</div>
                      <div className="absolute bottom-3 left-3">
                        <span className="badge bg-slate-900/80 backdrop-blur-md text-white border-0 text-xs font-medium px-2.5 py-1">
                          {a.category}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 flex flex-col justify-between shrink-0">
                      <div className="flex justify-between items-start">
                        <span className="badge bg-white/20 backdrop-blur-md text-white border-0 text-xs font-semibold">
                          {a.category}
                        </span>
                        {statusBadge(a.status)}
                      </div>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {a.title}
                      </h3>
                      {a.unit && (
                        <p className="text-xs text-slate-500 font-medium mt-1">{a.unit}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Thời gian:</span>
                        <span className="font-medium text-slate-700">{new Date(a.startAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Địa điểm:</span>
                        <span className="font-medium text-slate-700 truncate max-w-[140px]">{a.location ?? 'Chưa xác định'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Số lượng:</span>
                        <span className="font-medium text-slate-700">{a.registered}/{a.capacity ?? '—'} người</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button onClick={() => navigate(`/student/activities/${a.id}`)} className="btn-secondary text-xs w-full justify-center py-2 font-semibold">
                        Xem chi tiết & Đăng ký
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Pagination page={page} total={filtered.length} perPage={10} onChange={setPage} />
        </>
      )}
    </div>
  )
}
