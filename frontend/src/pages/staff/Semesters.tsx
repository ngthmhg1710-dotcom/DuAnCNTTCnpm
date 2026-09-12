import { semesters } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'
import { Toast } from '../../components/ui/Toast'
import { useState } from 'react'

export default function StaffSemesters() {
  const [toast, setToast] = useState('')
  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý học kỳ</h1>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">Học kỳ</th>
              <th className="text-left px-4 py-3">Năm học</th>
              <th className="text-left px-4 py-3">Bắt đầu</th>
              <th className="text-left px-4 py-3">Kết thúc</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {semesters.map(s => (
              <tr key={s.id} className="table-row">
                <td className="px-4 py-3 font-semibold text-slate-800">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.year}</td>
                <td className="px-4 py-3 text-slate-600">{s.start}</td>
                <td className="px-4 py-3 text-slate-600">{s.end}</td>
                <td className="px-4 py-3">{statusBadge(s.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="btn-secondary text-xs py-1 px-2">Xem</button>
                    <button className="btn-secondary text-xs py-1 px-2">Sửa</button>
                    {s.status !== 'Hiện tại' && (
                      <button onClick={() => setToast('Đã đặt làm học kỳ hiện tại!')} className="btn-primary text-xs py-1 px-2">Đặt hiện tại</button>
                    )}
                  </div>
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
