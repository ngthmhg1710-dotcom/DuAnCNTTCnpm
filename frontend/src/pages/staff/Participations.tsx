import { useEffect, useState } from 'react'
import { getParticipations, type ParticipationRow } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'

const STATUS_LABEL: Record<string, string> = {
  REGISTERED: 'Đã đăng ký',
  ATTENDED: 'Đã tham gia',
  ABSENT: 'Vắng',
}

export default function StaffParticipations() {
  const [rows, setRows] = useState<ParticipationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getParticipations().then(setRows).finally(() => setLoading(false))
  }, [])

  const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.mssv.includes(search))

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý tham gia</h1>
        <p className="text-slate-500 text-sm mt-1">Theo dõi trạng thái tham gia của sinh viên</p>
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <input className="input w-full sm:w-auto sm:max-w-xs" placeholder="Tìm theo tên, MSSV..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">MSSV</th>
              <th className="text-left px-4 py-3">Họ tên</th>
              <th className="text-left px-4 py-3">Hoạt động</th>
              <th className="text-left px-4 py-3">Ngày đăng ký</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">Đang tải...</td></tr>
            )}
            {!loading && filtered.map(r => (
              <tr key={r.id} className="table-row">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.mssv}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                <td className="px-4 py-3 text-slate-600">{r.activity}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(r.registeredAt).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3">{statusBadge(STATUS_LABEL[r.status])}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">Không có dữ liệu tham gia</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
