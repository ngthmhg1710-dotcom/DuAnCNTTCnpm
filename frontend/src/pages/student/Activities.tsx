import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { activities } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'

export default function StudentActivities() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)

  const filtered = activities.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) &&
    (!filterType || a.type === filterType) &&
    (!filterStatus || a.status === filterStatus)
  )

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Danh sách hoạt động</h1>
        <p className="text-slate-500 text-sm mt-1">Tất cả hoạt động học kỳ HK1 2024-2025</p>
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
          <option>HK1 2024-2025</option>
          <option>HK2 2023-2024</option>
        </select>
        {(search || filterType || filterStatus) && (
          <button onClick={() => { setSearch(''); setFilterType(''); setFilterStatus('') }} className="btn-secondary text-xs">Xóa bộ lọc</button>
        )}
      </div>

      {/* Mobile Card List View (For Mobile Phones) */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-slate-400 text-sm">Chưa có dữ liệu</div>
        ) : (
          filtered.map(a => (
            <div key={a.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-slate-800 text-sm leading-snug">{a.name}</div>
                <div className="shrink-0">{statusBadge(a.status)}</div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="badge bg-blue-50 text-blue-700 border border-blue-200">{a.type}</span>
                <span className="badge bg-slate-100 text-slate-600 border border-slate-200">{a.unit}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div><span className="text-slate-400">Thời gian:</span> <span className="font-medium text-slate-700">{a.startDate}</span></div>
                <div><span className="text-slate-400">Số lượng:</span> <span className="font-medium text-slate-700">{a.registered}/{a.capacity}</span></div>
                <div className="col-span-2"><span className="text-slate-400">Địa điểm:</span> <span className="font-medium text-slate-700">{a.location}</span></div>
              </div>
              <div className="pt-1">
                <button onClick={() => navigate(`/student/activities/${a.id}`)} className="btn-secondary text-xs w-full justify-center py-2">Xem chi tiết</button>
              </div>
            </div>
          ))
        )}
        <Pagination page={page} total={filtered.length} perPage={10} onChange={setPage} />
      </div>

      {/* Desktop Table View (For Tablet & Desktop) */}
      <div className="hidden md:block card overflow-hidden">
        <div className="table-responsive-wrapper">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">Tên hoạt động</th>
                <th className="text-left px-4 py-3">Loại</th>
                <th className="text-left px-4 py-3">Đơn vị tổ chức</th>
                <th className="text-left px-4 py-3">Thời gian</th>
                <th className="text-left px-4 py-3">Địa điểm</th>
                <th className="text-left px-4 py-3">Số lượng</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">Chưa có dữ liệu</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-slate-800 min-w-[220px] max-w-md whitespace-normal leading-snug">
                    {a.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.type}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{a.unit}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{a.startDate}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{a.location}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{a.registered}/{a.capacity}</td>
                  <td className="px-4 py-3">{statusBadge(a.status)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/student/activities/${a.id}`)} className="btn-secondary text-xs py-1">Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} perPage={10} onChange={setPage} />
      </div>
    </div>
  )
}
