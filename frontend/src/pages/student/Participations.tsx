import { useEffect, useState } from 'react'
import { statusBadge } from '../../components/ui/Badge'
import { getStudentRegistrations, type RegisteredActivityItem } from '../../lib/api'

export default function StudentParticipations() {
  const [rows, setRows] = useState<RegisteredActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getStudentRegistrations()
      .then(r => setRows(r.filter(x => x.status === 'Đã tham gia')))
      .finally(() => setLoading(false))
  }, [])

  const filtered = rows.filter(p => p.activity.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Hoạt động đã tham gia</h1>
        <p className="text-slate-500 text-sm mt-1">Các hoạt động cán bộ đã xác nhận bạn có mặt</p>
      </div>

      <div className="card mb-5 p-4">
        <input className="input w-full sm:max-w-xs" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">Hoạt động</th>
                <th className="text-left px-4 py-3">Loại</th>
                <th className="text-left px-4 py-3">Ngày đăng ký</th>
                <th className="text-left px-4 py-3">Đơn vị tổ chức</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-normal leading-snug">{p.activity}</td>
                  <td className="px-4 py-3 text-slate-600">{p.category ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{p.registeredDate}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{p.unit ?? '—'}</td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-slate-500">Chưa có hoạt động nào được xác nhận tham gia</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
