import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecommendations } from '../../lib/api'

type Recommendation = {
  student: string
  mssv: string
  missing: string
  activityId: number | null
  activityTitle: string | null
  category: string | null
  startAt: string | null
}

export default function StaffRecommendations() {
  const navigate = useNavigate()
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRecommendations().then(setRecs).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Hoạt động đề xuất</h1>
        <p className="text-slate-500 text-sm mt-1">Đề xuất hoạt động phù hợp cho sinh viên cần hoàn thiện tiêu chí</p>
      </div>

      {loading && <div className="card p-8 text-center text-slate-400 text-sm">Đang tải...</div>}

      <div className="space-y-4">
        {!loading && recs.map((r, i) => (
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
                {r.activityTitle ? (
                  <>
                    <div className="text-sm font-medium text-blue-700">{r.activityTitle}</div>
                    <div className="text-xs text-slate-500">{r.category} · {r.startAt && new Date(r.startAt).toLocaleDateString('vi-VN')}</div>
                  </>
                ) : (
                  <div className="text-sm text-slate-400">Chưa có hoạt động phù hợp sắp diễn ra</div>
                )}
              </div>
            </div>
            {r.activityId && (
              <button onClick={() => navigate(`/staff/activities/${r.activityId}`)} className="btn-primary text-xs shrink-0 self-start sm:self-auto">Xem hoạt động</button>
            )}
          </div>
        ))}
        {!loading && recs.length === 0 && (
          <div className="card p-8 text-center text-slate-400 text-sm">Không có đề xuất nào</div>
        )}
      </div>
    </div>
  )
}
