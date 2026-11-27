import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Toast } from '../../components/ui/Toast'
import { downloadReport, type ReportType } from '../../lib/api'

const reports: { id: ReportType; title: string; desc: string }[] = [
  { id: 'students', title: 'Danh sách sinh viên tham gia', desc: 'Danh sách sinh viên cùng số hoạt động đã đăng ký, đã tham gia và mức tham gia' },
  { id: 'history', title: 'Lịch sử hoạt động', desc: 'Từng lượt đăng ký / tham gia của sinh viên: hoạt động, thời gian, trạng thái, điểm' },
  { id: 'by-semester', title: 'Hoạt động theo học kỳ', desc: 'Số hoạt động, lượt đăng ký và tỷ lệ tham gia theo từng học kỳ và loại hoạt động' },
  { id: 'low-participation', title: 'Sinh viên tham gia thấp', desc: 'Sinh viên tham gia dưới chuẩn, nhóm còn thiếu và đề xuất' },
  { id: 'verification', title: 'Báo cáo xác minh', desc: 'Danh sách khai báo minh chứng và trạng thái xử lý' },
]

export default function StaffReports() {
  const navigate = useNavigate()
  const [toast, setToast] = useState('')
  const exportXlsx = (id: ReportType) => downloadReport(id).catch(() => setToast('Không xuất được Excel. Vui lòng thử lại.'))
  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Báo cáo</h1>
        <p className="text-slate-500 text-sm mt-1">Xem theo học kỳ, khóa, lớp, loại hoạt động và xuất Excel. Cần PDF thì mở báo cáo rồi bấm In → Lưu thành PDF.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(r => (
          <div key={r.id} className="card p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl shrink-0">📊</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800">{r.title}</div>
              <div className="text-slate-500 text-xs mt-1 leading-relaxed">{r.desc}</div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => navigate(`/staff/reports/${r.id}`)} className="btn-secondary text-xs py-1">Xem báo cáo</button>
                <button onClick={() => exportXlsx(r.id)} className="btn-secondary text-xs py-1">📥 Excel</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
