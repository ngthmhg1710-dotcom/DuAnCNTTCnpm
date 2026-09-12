import { useNavigate } from 'react-router-dom'
import { declarations } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'

export default function StudentDeclarations() {
  const navigate = useNavigate()
  return (
    <div className="page-container">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Khai báo hoạt động</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý các khai báo hoạt động ngoài nhà trường</p>
        </div>
        <button onClick={() => navigate('/student/declarations/create')} className="btn-primary">
          + Khai báo hoạt động
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">Mã khai báo</th>
              <th className="text-left px-4 py-3">Tên hoạt động</th>
              <th className="text-left px-4 py-3">Đơn vị tổ chức</th>
              <th className="text-left px-4 py-3">Ngày gửi</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-left px-4 py-3">Người xử lý</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {declarations.map(d => (
              <tr key={d.id} className="table-row">
                <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{d.id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{d.name}</td>
                <td className="px-4 py-3 text-slate-600">{d.unit}</td>
                <td className="px-4 py-3 text-slate-600">{d.submittedDate}</td>
                <td className="px-4 py-3">{statusBadge(d.status)}</td>
                <td className="px-4 py-3 text-slate-600">{d.handler}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/student/declarations/${d.id}`)} className="btn-secondary text-xs py-1">Xem</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
