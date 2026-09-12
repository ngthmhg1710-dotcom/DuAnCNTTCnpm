import { useNavigate } from 'react-router-dom'
import { syncHistory } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'

export default function AdminSynchronization() {
  const navigate = useNavigate()
  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Đồng bộ dữ liệu</h1>
        <p className="text-slate-500 text-sm mt-1">Theo dõi và quản lý quá trình đồng bộ</p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        {[['Tổng sync', '2,382', 'bg-slate-50'], ['Thành công', '2,341', 'bg-green-50'], ['Lỗi', '41', 'bg-red-50'], ['Đang chạy', '1', 'bg-blue-50'], ['Records', '124,891', 'bg-purple-50']].map(([l, v, c]) => (
          <div key={l} className={`stat-card ${c}`}>
            <div className="text-xl font-bold text-slate-800">{v}</div>
            <div className="text-xs text-slate-500 mt-1">{l}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">Tích hợp</th>
              <th className="text-left px-4 py-3">Thời gian</th>
              <th className="text-left px-4 py-3">Records</th>
              <th className="text-left px-4 py-3">Thành công</th>
              <th className="text-left px-4 py-3">Lỗi</th>
              <th className="text-left px-4 py-3">Thời lượng</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {syncHistory.map(s => (
              <tr key={s.id} className="table-row">
                <td className="px-4 py-3 font-medium text-slate-800">{s.integration}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{s.time}</td>
                <td className="px-4 py-3 text-slate-600">{s.records.toLocaleString()}</td>
                <td className="px-4 py-3 text-green-600 font-medium">{s.success.toLocaleString()}</td>
                <td className="px-4 py-3 text-red-500 font-medium">{s.failed}</td>
                <td className="px-4 py-3 text-slate-600 font-mono text-xs">{s.duration}</td>
                <td className="px-4 py-3">{statusBadge(s.status)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/admin/synchronization/${s.id}`)} className="btn-secondary text-xs py-1">Xem</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
