import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { students } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'

export default function StaffStudents() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.mssv.includes(search)
  )

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý sinh viên</h1>
        <p className="text-slate-500 text-sm mt-1">{students.length} sinh viên · HK1 2024-2025</p>
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <input className="input w-full sm:w-auto sm:max-w-xs" placeholder="Tìm theo tên, MSSV..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select w-full sm:w-auto"><option value="">Tất cả lớp</option><option>TH21A</option><option>TH21B</option><option>TH22A</option></select>
        <select className="select w-full sm:w-auto"><option value="">Tất cả khóa</option><option>2021</option><option>2022</option></select>
        <select className="select w-full sm:w-auto"><option value="">Tất cả ngành</option><option>CNTT</option><option>HTTT</option></select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">MSSV</th>
              <th className="text-left px-4 py-3">Họ tên</th>
              <th className="text-left px-4 py-3">Lớp</th>
              <th className="text-left px-4 py-3">Khóa</th>
              <th className="text-left px-4 py-3">Ngành</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-left px-4 py-3">Số HĐ</th>
              <th className="text-left px-4 py-3">Mức tham gia</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(s => (
              <tr key={s.id} className="table-row">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.mssv}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.class}</td>
                <td className="px-4 py-3 text-slate-600">{s.cohort}</td>
                <td className="px-4 py-3 text-slate-600">{s.major}</td>
                <td className="px-4 py-3">{statusBadge(s.status)}</td>
                <td className="px-4 py-3 text-slate-600">{s.activities}</td>
                <td className="px-4 py-3">{statusBadge(s.participation)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/staff/students/${s.id}`)} className="btn-secondary text-xs py-1">Xem chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
