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

      <div className="card mb-5 p-4 flex gap-3">
        <input className="input max-w-xs" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select"><option>Tất cả loại</option><option>Tình nguyện</option><option>Học thuật</option></select>
        <select className="select"><option>Tất cả học kỳ</option><option>HK1 2024-2025</option></select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
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
                <td className="px-4 py-3 font-medium text-slate-800">{p.activity}</td>
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
  )
}
