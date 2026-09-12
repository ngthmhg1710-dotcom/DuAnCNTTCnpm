import { useParams, useNavigate } from 'react-router-dom'
import { students } from '../../data/mock'
import { Toast } from '../../components/ui/Toast'
import { useState } from 'react'

export default function StaffReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [toast, setToast] = useState('')

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>

      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-slate-800">Báo cáo #{id} – Danh sách sinh viên tham gia</h1>
        <div className="flex gap-2">
          <button onClick={() => setToast('Xuất Excel thành công!')} className="btn-secondary">📥 Excel</button>
          <button onClick={() => setToast('Xuất PDF thành công!')} className="btn-secondary">📄 PDF</button>
          <button onClick={() => window.print()} className="btn-secondary">🖨️ In</button>
        </div>
      </div>

      <div className="card mb-4 p-4 flex gap-3">
        <select className="select"><option>HK1 2024-2025</option></select>
        <select className="select"><option>Tất cả lớp</option></select>
        <button className="btn-primary text-xs">Áp dụng</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">MSSV</th>
              <th className="text-left px-4 py-3">Họ tên</th>
              <th className="text-left px-4 py-3">Lớp</th>
              <th className="text-left px-4 py-3">Khóa</th>
              <th className="text-left px-4 py-3">Số hoạt động</th>
              <th className="text-left px-4 py-3">Mức tham gia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map((s, i) => (
              <tr key={s.id} className="table-row">
                <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.mssv}</td>
                <td className="px-4 py-3 text-slate-800">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.class}</td>
                <td className="px-4 py-3 text-slate-600">{s.cohort}</td>
                <td className="px-4 py-3 text-slate-600">{s.activities}</td>
                <td className="px-4 py-3 text-slate-600">{s.participation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
