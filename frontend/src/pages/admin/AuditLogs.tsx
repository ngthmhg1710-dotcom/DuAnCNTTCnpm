import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuditLogs, type AuditLogItem } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'

export const actionLabel: Record<string, string> = {
  LOGIN: 'Đăng nhập', CREATE: 'Tạo mới', UPDATE: 'Cập nhật', DELETE: 'Xóa', IMPORT: 'Import',
  REGISTER: 'Đăng ký', CANCEL: 'Hủy đăng ký', RECEIVE: 'Tiếp nhận', APPROVE: 'Duyệt', REJECT: 'Từ chối', REQUEST_INFO: 'Yêu cầu bổ sung',
}
export const fmtTime = (t: string) => new Date(t).toLocaleString('vi-VN')

export default function AdminAuditLogs() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [action, setAction] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    getAuditLogs().then(setLogs).catch(() => setError('Không tải được nhật ký (phiên đăng nhập hết hạn hoặc lỗi server).')).finally(() => setLoading(false))
  }, [])

  const rows = logs.filter(l =>
    `${l.user} ${l.detail ?? ''} ${l.objectId ?? ''}`.toLowerCase().includes(q.toLowerCase()) &&
    (!role || l.role === role) &&
    (!action || l.action === action) &&
    (!date || new Date(l.time).toLocaleDateString('sv') === date)
  )

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Audit Log</h1>
        <p className="text-slate-500 text-sm mt-1">Nhật ký hoạt động hệ thống{!loading && ` (${rows.length} bản ghi)`}</p>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <input className="input w-full sm:w-auto sm:max-w-xs" placeholder="Tìm theo người dùng, chi tiết..." value={q} onChange={e => setQ(e.target.value)} />
        <select className="select w-full sm:w-auto" value={role} onChange={e => setRole(e.target.value)}>
          <option value="">Tất cả vai trò</option><option>Admin</option><option>Cán bộ</option><option>Sinh viên</option>
        </select>
        <select className="select w-full sm:w-auto" value={action} onChange={e => setAction(e.target.value)}>
          <option value="">Tất cả hành động</option>
          {Object.entries(actionLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="date" className="select w-full sm:w-auto" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">Thời gian</th>
                <th className="text-left px-4 py-3">Người dùng</th>
                <th className="text-left px-4 py-3">Vai trò</th>
                <th className="text-left px-4 py-3">Hành động</th>
                <th className="text-left px-4 py-3">Đối tượng</th>
                <th className="text-left px-4 py-3">Mã đối tượng</th>
                <th className="text-left px-4 py-3">Kết quả</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && <tr><td colSpan={8} className="text-center py-10 text-slate-400">Đang tải...</td></tr>}
              {rows.map(log => (
                <tr key={log.id} className="table-row">
                  <td className="px-4 py-3 text-slate-600 text-xs font-mono whitespace-nowrap">{fmtTime(log.time)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{log.user}</td>
                  <td className="px-4 py-3 text-slate-600">{log.role}</td>
                  <td className="px-4 py-3">
                    <span className={`badge border ${log.action === 'APPROVE' ? 'bg-green-50 text-green-700 border-green-200' : log.action === 'REJECT' || log.action === 'DELETE' ? 'bg-red-50 text-red-700 border-red-200' : log.action === 'CREATE' || log.action === 'IMPORT' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{actionLabel[log.action] ?? log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{log.object}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.objectId ?? '—'}</td>
                  <td className="px-4 py-3">{statusBadge(log.status)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/admin/audit-logs/${log.id}`)} className="btn-secondary text-xs py-1">Xem</button>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-slate-500">Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
