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
      <div className="card mb-5 p-4 flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Tìm kiếm hoạt động..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">Tất cả loại</option>
          <option>Tình nguyện</option>
          <option>Học thuật</option>
          <option>Văn hóa – Văn nghệ</option>
        </select>
        <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option>Đang mở</option>
          <option>Đã kết thúc</option>
        </select>
        <select className="select">
          <option>HK1 2024-2025</option>
          <option>HK2 2023-2024</option>
        </select>
        {(search || filterType || filterStatus) && (
          <button onClick={() => { setSearch(''); setFilterType(''); setFilterStatus('') }} className="btn-secondary text-xs">Xóa bộ lọc</button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
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
                <td className="px-4 py-3 font-medium text-slate-800 max-w-xs">
                  <div className="truncate">{a.name}</div>
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
        <Pagination page={page} total={filtered.length} perPage={10} onChange={setPage} />
      </div>
    </div>
  )
}
