import { useState } from 'react'
import { statusBadge } from '../../components/ui/Badge'

const participations = [
  { id: 1, activity: 'Ngày hội tình nguyện mùa hè 2024', type: 'Tình nguyện', time: '15/06/2024', unit: 'Đoàn Khoa CNTT', status: 'Đã xác minh', criteria: 'Tình nguyện & Cộng đồng', result: 'Đạt' },
  { id: 2, activity: 'Hội thảo kỹ năng mềm', type: 'Học thuật', time: '10/07/2024', unit: 'CLB Kỹ năng TDTU', status: 'Đã xác minh', criteria: 'Học thuật & Chuyên môn', result: 'Đạt' },
  { id: 3, activity: 'Cuộc thi lập trình ACM ICPC', type: 'Học thuật', time: '20/08/2024', unit: 'Khoa CNTT', status: 'Đã xác minh', criteria: 'Học thuật & Chuyên môn', result: 'Đạt' },
  { id: 4, activity: 'Hiến máu nhân đạo lần 2', type: 'Tình nguyện', time: '05/03/2024', unit: 'Hội Chữ thập đỏ', status: 'Đã xác minh', criteria: 'Tình nguyện & Cộng đồng', result: 'Đạt' },
  { id: 5, activity: 'Ngày văn hóa các dân tộc VN', type: 'Văn hóa – Văn nghệ', time: '11/11/2023', unit: 'Đoàn Trường', status: 'Đã xác minh', criteria: 'Văn hóa & Thể thao', result: 'Đạt' },
]

export default function StudentParticipations() {
  const [search, setSearch] = useState('')
  const filtered = participations.filter(p => p.activity.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Hoạt động đã tham gia</h1>
        <p className="text-slate-500 text-sm mt-1">Lịch sử tham gia và kết quả xác minh</p>
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <input className="input w-full sm:w-auto sm:max-w-xs" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select w-full sm:w-auto"><option>Tất cả loại</option><option>Tình nguyện</option><option>Học thuật</option></select>
        <select className="select w-full sm:w-auto"><option>Tất cả học kỳ</option><option>HK1 2024-2025</option></select>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-slate-800 text-sm leading-snug">{p.activity}</div>
              <div className="shrink-0">
                <span className="badge bg-green-50 text-green-700 border border-green-200">{p.result}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="badge bg-blue-50 text-blue-700 border border-blue-200">{p.type}</span>
              <span className="badge bg-slate-100 text-slate-600 border border-slate-200">{p.unit}</span>
              {statusBadge(p.status)}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div><span className="text-slate-400">Thời gian:</span> <span className="font-medium text-slate-700">{p.time}</span></div>
              <div className="col-span-2"><span className="text-slate-400">Tiêu chí:</span> <span className="font-medium text-slate-700">{p.criteria}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-hidden">
        <div className="table-responsive-wrapper">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">Hoạt động</th>
                <th className="text-left px-4 py-3">Loại</th>
                <th className="text-left px-4 py-3">Thời gian</th>
                <th className="text-left px-4 py-3">Đơn vị tổ chức</th>
                <th className="text-left px-4 py-3">Tiêu chí liên quan</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
                <th className="text-left px-4 py-3">Kết quả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-slate-800 min-w-[220px] max-w-md whitespace-normal leading-snug">{p.activity}</td>
                  <td className="px-4 py-3 text-slate-600">{p.type}</td>
                  <td className="px-4 py-3 text-slate-600">{p.time}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{p.unit}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{p.criteria}</td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-green-50 text-green-700 border border-green-200">{p.result}</span>
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
