import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCriteriaProgressDetail, type CriteriaProgressDetail } from '../../lib/api'

export default function CriteriaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [g, setG] = useState<CriteriaProgressDetail | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    getCriteriaProgressDetail(id!).then(setG).catch(() => setError('Không tìm thấy tiêu chí.'))
  }, [id])

  if (error) return <div className="page-container"><div className="card p-6 text-sm text-red-600">{error}</div></div>
  if (!g) return <div className="page-container text-sm text-slate-500">Đang tải...</div>
  const missing_acts = g.missing ? [{ name: `Còn thiếu ${g.missing} hoạt động ${g.group}`, note: `Cần ${g.required}, đã có ${g.current}` }] : []

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
      <h1 className="text-xl font-bold text-slate-800 mb-1">{g.name}</h1>
      <p className="text-slate-500 text-sm mb-5">Thông tin hỗ trợ theo dõi, không phải chấm điểm rèn luyện chính thức</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[['Mức yêu cầu', `${g.required} hoạt động`], ['Kết quả hiện tại', `${g.current} hoạt động`], ['Còn thiếu', `${g.missing} hoạt động`]].map(([k, v]) => (
          <div key={k} className="stat-card text-center">
            <div className="text-lg font-bold text-slate-800">{v}</div>
            <div className="text-xs text-slate-500 mt-1">{k}</div>
          </div>
        ))}
      </div>

      <div className="card mb-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 font-semibold text-sm text-slate-700">Hoạt động đã được ghi nhận</div>
        {g.done.length === 0 ? (
          <div className="px-5 py-6 text-slate-400 text-sm text-center">Chưa có hoạt động nào</div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="w-full min-w-[500px] text-sm">
              <thead><tr className="table-header"><th className="text-left px-4 py-3">Tên hoạt động</th><th className="text-left px-4 py-3">Ngày</th><th className="text-left px-4 py-3">Trạng thái</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {g.done.map((d, i) => (
                  <tr key={i} className="table-row">
                    <td className="px-4 py-3 text-slate-700 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(d.date).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3"><span className="badge bg-green-50 text-green-700 border border-green-200">{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {missing_acts.length > 0 && (
        <div className="card mb-4 p-5">
          <div className="font-semibold text-sm text-slate-700 mb-3">Hoạt động còn thiếu</div>
          {missing_acts.map((m, i) => (
            <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              ⚠️ {m.name} <span className="text-amber-600">({m.note})</span>
            </div>
          ))}
        </div>
      )}

      {g.recommended.length > 0 && (
        <div className="card p-5">
          <div className="font-semibold text-sm text-slate-700 mb-3">Hoạt động đề xuất</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {g.recommended.map((r: any) => (
              <div key={r.id} className="bg-slate-50 rounded-lg p-4">
                <div className="font-medium text-sm text-slate-800">{r.name}</div>
                <div className="text-xs text-slate-500 mt-1">{r.unit} · {new Date(r.time).toLocaleDateString('vi-VN')}</div>
                <button onClick={() => navigate(`/student/activities/${r.id}`)} className="btn-primary text-xs mt-3 py-1">Xem hoạt động</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
