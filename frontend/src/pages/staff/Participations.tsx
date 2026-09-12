import { useState } from 'react'
import { statusBadge } from '../../components/ui/Badge'
import { Toast } from '../../components/ui/Toast'

const data = [
  { id: 1, mssv: '521H0001', name: 'Nguyễn Minh Tuấn', activity: 'Ngày hội tình nguyện mùa hè', regDate: '01/06/2024', status: 'Đã tham gia', verified: 'Đã xác minh' },
  { id: 2, mssv: '521H0002', name: 'Trần Thị Bích Ngọc', activity: 'Hiến máu nhân đạo lần 3', regDate: '28/08/2024', status: 'Đã đăng ký', verified: 'Chờ xác minh' },
  { id: 3, mssv: '521H0003', name: 'Lê Văn Hùng', activity: 'Seminar AI & ML', regDate: '15/09/2024', status: 'Vắng', verified: 'Không' },
  { id: 4, mssv: '521H0004', name: 'Phạm Thị Lan Anh', activity: 'Workshop UI/UX', regDate: '01/10/2024', status: 'Đã tham gia', verified: 'Đang xác minh' },
]

export default function StaffParticipations() {
  const [statuses, setStatuses] = useState<Record<number, string>>(Object.fromEntries(data.map(d => [d.id, d.status])))
  const [toast, setToast] = useState('')

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý tham gia</h1>
        <p className="text-slate-500 text-sm mt-1">Cập nhật trạng thái tham gia của sinh viên</p>
      </div>

      <div className="card mb-5 p-4 flex gap-3">
        <input className="input max-w-xs" placeholder="Tìm theo tên, MSSV..." />
        <select className="select"><option>Tất cả hoạt động</option></select>
        <select className="select"><option>Tất cả trạng thái</option><option>Đã đăng ký</option><option>Đã tham gia</option><option>Vắng</option></select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">MSSV</th>
              <th className="text-left px-4 py-3">Họ tên</th>
              <th className="text-left px-4 py-3">Hoạt động</th>
              <th className="text-left px-4 py-3">Ngày đăng ký</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-left px-4 py-3">Xác minh</th>
              <th className="px-4 py-3">Cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map(d => (
              <tr key={d.id} className="table-row">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{d.mssv}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{d.name}</td>
                <td className="px-4 py-3 text-slate-600">{d.activity}</td>
                <td className="px-4 py-3 text-slate-600">{d.regDate}</td>
                <td className="px-4 py-3">{statusBadge(statuses[d.id])}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{d.verified}</td>
                <td className="px-4 py-3">
                  <select className="select text-xs py-1" value={statuses[d.id]}
                    onChange={e => { setStatuses(p => ({ ...p, [d.id]: e.target.value })); setToast('Đã cập nhật trạng thái!') }}>
                    <option>Đã đăng ký</option>
                    <option>Đã tham gia</option>
                    <option>Vắng</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
