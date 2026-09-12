import { useParams, useNavigate } from 'react-router-dom'
import { auditLogs } from '../../data/mock'

export default function AdminAuditDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const log = auditLogs.find(x => x.id === Number(id)) ?? auditLogs[0]

  const hasDiff = log.action === 'UPDATE'

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
      <h1 className="text-xl font-bold text-slate-800 mb-5">Chi tiết Audit Log #{log.id}</h1>

      <div className="card p-5 mb-5">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {[['Người thực hiện', log.user], ['Vai trò', log.role], ['Hành động', log.action], ['Đối tượng', log.object], ['Object ID', log.objectId], ['Thời gian', log.time], ['Kết quả', log.status]].map(([k, v]) => (
            <div key={k}><dt className="text-slate-500 text-xs">{k}</dt><dd className="text-slate-800 font-medium mt-0.5 font-mono">{v}</dd></div>
          ))}
        </dl>
      </div>

      {hasDiff && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 font-semibold text-sm text-slate-700">Thay đổi dữ liệu</div>
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            <div className="p-5">
              <div className="text-xs font-bold text-red-600 mb-3 uppercase tracking-wide">TRƯỚC</div>
              <pre className="text-xs text-slate-600 bg-red-50 rounded-lg p-3 overflow-auto">{JSON.stringify({ status: 'Đang học', lastLogin: '15/08/2026' }, null, 2)}</pre>
            </div>
            <div className="p-5">
              <div className="text-xs font-bold text-green-600 mb-3 uppercase tracking-wide">SAU</div>
              <pre className="text-xs text-slate-600 bg-green-50 rounded-lg p-3 overflow-auto">{JSON.stringify({ status: 'Hoạt động', lastLogin: '18/08/2026' }, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
