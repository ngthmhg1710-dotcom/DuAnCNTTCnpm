import { useNavigate } from 'react-router-dom'
import { Toast } from '../../components/ui/Toast'
import { useState } from 'react'

const reports = [
  { id: 1, title: 'Danh sách sinh viên tham gia', desc: 'Danh sách đầy đủ sinh viên và số hoạt động tham gia theo học kỳ' },
  { id: 2, title: 'Lịch sử hoạt động', desc: 'Tổng hợp tất cả hoạt động đã diễn ra trong học kỳ' },
  { id: 3, title: 'Hoạt động theo học kỳ', desc: 'Thống kê số lượng và phân loại hoạt động theo học kỳ' },
  { id: 4, title: 'Sinh viên tham gia thấp', desc: 'Danh sách sinh viên có mức độ tham gia dưới chuẩn' },
  { id: 5, title: 'Báo cáo xác minh', desc: 'Thống kê trạng thái xác minh khai báo của sinh viên' },
]

export default function StaffReports() {
  const navigate = useNavigate()
  const [toast, setToast] = useState('')
  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Báo cáo</h1>
        <p className="text-slate-500 text-sm mt-1">Xuất báo cáo theo học kỳ và tiêu chí</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {reports.map(r => (
          <div key={r.id} className="card p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">📊</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800">{r.title}</div>
              <div className="text-slate-500 text-xs mt-1 leading-relaxed">{r.desc}</div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => navigate(`/staff/reports/${r.id}`)} className="btn-secondary text-xs py-1">Xem báo cáo</button>
                <button onClick={() => setToast('Đang xuất Excel...')} className="btn-secondary text-xs py-1">📥 Excel</button>
                <button onClick={() => setToast('Đang xuất PDF...')} className="btn-secondary text-xs py-1">📄 PDF</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
