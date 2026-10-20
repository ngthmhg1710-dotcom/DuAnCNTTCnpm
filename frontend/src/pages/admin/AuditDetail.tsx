import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAuditLogs, type AuditLogItem } from '../../lib/api'
import { actionLabel, fmtTime } from './AuditLogs'

export default function AdminAuditDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [log, setLog] = useState<AuditLogItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAuditLogs().then(ls => setLog(ls.find(x => x.id === Number(id)) ?? null)).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
      <h1 className="text-xl font-bold text-slate-800 mb-5">Chi tiết Audit Log #{id}</h1>

      {loading && <p className="text-slate-400">Đang tải...</p>}
      {!loading && !log && <p className="text-slate-500">Không tìm thấy bản ghi.</p>}
      {log && (
        <div className="card p-5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Người thực hiện', log.user],
              ['Vai trò', log.role],
              ['Hành động', actionLabel[log.action] ?? log.action],
              ['Đối tượng', log.object],
              ['Mã đối tượng', log.objectId ?? '—'],
              ['Thời gian', fmtTime(log.time)],
              ['Kết quả', log.status],
              ['Chi tiết', log.detail ?? '—'],
            ].map(([k, v]) => (
              <div key={k}><dt className="text-slate-500 text-xs">{k}</dt><dd className="text-slate-800 font-medium mt-0.5">{v}</dd></div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
