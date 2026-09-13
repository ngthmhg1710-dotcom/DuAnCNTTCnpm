import { useNavigate } from 'react-router-dom'
import { auditLogs } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'

export default function AdminAuditLogs() {
  const navigate = useNavigate()
  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Audit Log</h1>
        <p className="text-slate-500 text-sm mt-1">Nhật ký hoạt động hệ thống</p>
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <input className="input w-full sm:w-auto sm:max-w-xs" placeholder="Tìm theo user..." />
        <select className="select w-full sm:w-auto"><option>Tất cả vai trò</option><option>Admin</option><option>Cán bộ</option><option>Sinh viên</option></select>
        <select className="select w-full sm:w-auto"><option>Tất cả action</option><option>CREATE</option><option>UPDATE</option><option>DELETE</option><option>APPROVE</option><option>REJECT</option></select>
        <input type="date" className="select w-full sm:w-auto" />
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
              <th className="text-left px-4 py-3">Object ID</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {auditLogs.map(log => (
              <tr key={log.id} className="table-row">
                <td className="px-4 py-3 text-slate-600 text-xs font-mono">{log.time}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{log.user}</td>
                <td className="px-4 py-3 text-slate-600">{log.role}</td>
                <td className="px-4 py-3">
                  <span className={`badge font-mono ${log.action === 'APPROVE' ? 'bg-green-50 text-green-700 border-green-200' : log.action === 'REJECT' ? 'bg-red-50 text-red-700 border-red-200' : log.action === 'CREATE' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'} border`}>{log.action}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{log.object}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.objectId}</td>
                <td className="px-4 py-3">{statusBadge(log.status)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/admin/audit-logs/${log.id}`)} className="btn-secondary text-xs py-1">Xem</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
