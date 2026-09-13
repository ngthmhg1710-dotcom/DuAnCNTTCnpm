import { useNavigate } from 'react-router-dom'
import { activities } from '../../data/mock'

const recs = [
  { student: 'Lê Văn Hùng', mssv: '521H0003', missing: 'Tình nguyện & Cộng đồng', activityId: 1 },
  { student: 'Hoàng Đức Thịnh', mssv: '521H0005', missing: 'Học thuật & Chuyên môn', activityId: 5 },
  { student: 'Đặng Quốc Bảo', mssv: '521H0007', missing: 'Văn hóa & Thể thao', activityId: 6 },
]

export default function StaffRecommendations() {
  const navigate = useNavigate()
  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Hoạt động đề xuất</h1>
        <p className="text-slate-500 text-sm mt-1">Đề xuất hoạt động phù hợp cho sinh viên cần hoàn thiện tiêu chí</p>
      </div>

      <div className="space-y-4">
        {recs.map((r, i) => {
          const act = activities.find(a => a.id === r.activityId)
          return (
            <div key={i} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {r.student.split(' ').map(w => w[0]).slice(-2).join('')}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800">{r.student}</div>
                  <div className="text-slate-500 text-xs">{r.mssv}</div>
                </div>
              </div>
              <div className="flex-1 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-6 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                <div className="sm:px-4 sm:border-l sm:border-r border-slate-100">
                  <div className="text-xs text-slate-500 mb-0.5">Còn thiếu</div>
                  <div className="text-sm font-medium text-amber-700">{r.missing}</div>
                </div>
                <div className="sm:px-4">
                  <div className="text-xs text-slate-500 mb-0.5">Đề xuất hoạt động</div>
                  <div className="text-sm font-medium text-blue-700">{act?.name}</div>
                  <div className="text-xs text-slate-500">{act?.type} · {act?.startDate}</div>
                </div>
              </div>
              <button onClick={() => navigate(`/staff/activities/${r.activityId}`)} className="btn-primary text-xs shrink-0 self-start sm:self-auto">Xem hoạt động</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
