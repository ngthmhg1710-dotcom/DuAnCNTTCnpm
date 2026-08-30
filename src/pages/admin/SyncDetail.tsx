import { useParams, useNavigate } from 'react-router-dom'
import { syncHistory } from '../../data/mock'
import { Toast } from '../../components/ui/Toast'
import { useState } from 'react'

export default function AdminSyncDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const s = syncHistory.find(x => x.id === Number(id)) ?? syncHistory[2]
  const [toast, setToast] = useState('')

  return (
    <div className="page-container max-w-4xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-slate-800">Chi tiết đồng bộ: {s.integration}</h1>
        {s.failed > 0 && <button onClick={() => setToast('Đang retry...')} className="btn-primary">Retry failed ({s.failed})</button>}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {[['Tích hợp', s.integration], ['Thời gian', s.time], ['Thời lượng', s.duration], ['Trạng thái', s.status]].map(([k, v]) => (
          <div key={k} className="stat-card"><div className="text-xs text-slate-500 mb-1">{k}</div><div className="font-semibold text-slate-800">{v}</div></div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[['Tổng records', s.records.toLocaleString(), 'text-slate-800'], ['Thành công', s.success.toLocaleString(), 'text-green-600'], ['Thất bại', s.failed, 'text-red-500']].map(([k, v, c]) => (
          <div key={k} className="stat-card text-center">
            <div className={`text-2xl font-bold ${c}`}>{v}</div>
            <div className="text-xs text-slate-500 mt-1">{k}</div>
          </div>
        ))}
      </div>

      {s.failed > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 font-semibold text-sm text-slate-700">Danh sách lỗi</div>
          <table className="w-full text-sm">
            <thead><tr className="table-header"><th className="text-left px-4 py-3">Record ID</th><th className="text-left px-4 py-3">Loại lỗi</th><th className="text-left px-4 py-3">Thông báo lỗi</th><th className="text-left px-4 py-3">Trạng thái</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {Array.from({ length: Math.min(s.failed, 5) }, (_, i) => (
                <tr key={i} className="table-row">
                  <td className="px-4 py-3 font-mono text-xs">REC-{2024001 + i}</td>
                  <td className="px-4 py-3 text-slate-600">VALIDATION_ERROR</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">Không tìm thấy MSSV trong hệ thống QLSV</td>
                  <td className="px-4 py-3"><span className="badge bg-red-50 text-red-700 border border-red-200">Lỗi</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
