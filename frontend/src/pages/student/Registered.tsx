import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { statusBadge } from '../../components/ui/Badge'

const registered = [
  { id: 1, activity: 'Ngày hội tình nguyện mùa hè 2024', time: '15/06/2024', location: 'Khu dân cư Q.7', registeredDate: '01/06/2024', status: 'Đã tham gia' },
  { id: 2, activity: 'Hội thảo kỹ năng mềm', time: '10/07/2024', location: 'Hội trường A', registeredDate: '25/06/2024', status: 'Đã tham gia' },
  { id: 3, activity: 'Cuộc thi lập trình ACM ICPC 2024', time: '20/08/2024', location: 'Phòng máy B201', registeredDate: '10/08/2024', status: 'Đã tham gia' },
  { id: 4, activity: 'Hiến máu nhân đạo lần 3', time: '05/09/2024', location: 'Sân A - TDTU', registeredDate: '28/08/2024', status: 'Đã đăng ký' },
  { id: 5, activity: 'Seminar AI & Machine Learning', time: '01/10/2024', location: 'Hội trường B', registeredDate: '15/09/2024', status: 'Đang xác minh' },
]

export default function StudentRegistered() {
  const navigate = useNavigate()
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = registered.filter(r => !filterStatus || r.status === filterStatus)

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Hoạt động đã đăng ký</h1>
        <p className="text-slate-500 text-sm mt-1">Danh sách các hoạt động bạn đã đăng ký tham gia</p>
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row gap-3">
        <select className="select w-full sm:w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option>Đã đăng ký</option>
          <option>Đã tham gia</option>
          <option>Vắng</option>
          <option>Đang xác minh</option>
          <option>Đã xác minh</option>
        </select>
        <select className="select w-full sm:w-auto">
          <option>HK1 2024-2025</option>
          <option>HK2 2023-2024</option>
        </select>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden space-y-3">
        {filtered.map(r => (
          <div key={r.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-slate-800 text-sm leading-snug">{r.activity}</div>
              <div className="shrink-0">{statusBadge(r.status)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div><span className="text-slate-400">Thời gian:</span> <span className="font-medium text-slate-700">{r.time}</span></div>
              <div><span className="text-slate-400">Ngày ĐK:</span> <span className="font-medium text-slate-700">{r.registeredDate}</span></div>
              <div className="col-span-2"><span className="text-slate-400">Địa điểm:</span> <span className="font-medium text-slate-700">{r.location}</span></div>
            </div>
            <div className="pt-1">
              <button onClick={() => navigate(`/student/activities/${r.id}`)} className="btn-secondary text-xs w-full justify-center py-2">Xem chi tiết</button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-hidden">
        <div className="table-responsive-wrapper">
          <table className="w-full min-w-[650px] text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">Hoạt động</th>
                <th className="text-left px-4 py-3">Thời gian</th>
                <th className="text-left px-4 py-3">Địa điểm</th>
                <th className="text-left px-4 py-3">Ngày đăng ký</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-slate-800">{r.activity}</td>
                  <td className="px-4 py-3 text-slate-600">{r.time}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{r.location}</td>
                  <td className="px-4 py-3 text-slate-600">{r.registeredDate}</td>
                  <td className="px-4 py-3">{statusBadge(r.status)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/student/activities/${r.id}`)} className="btn-secondary text-xs py-1">Xem</button>
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
