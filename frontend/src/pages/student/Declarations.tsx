import { useNavigate } from 'react-router-dom'
import { declarations } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'

export default function StudentDeclarations() {
  const navigate = useNavigate()
  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Khai báo hoạt động</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý các khai báo hoạt động ngoài nhà trường</p>
        </div>
        <button onClick={() => navigate('/student/declarations/create')} className="btn-primary self-start sm:self-auto">
          + Khai báo hoạt động
        </button>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden space-y-3">
        {declarations.map(d => (
          <div key={d.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-mono text-xs text-blue-600 font-semibold">{d.id}</div>
                <div className="font-semibold text-slate-800 text-sm leading-snug mt-0.5">{d.name}</div>
              </div>
              <div className="shrink-0">{statusBadge(d.status)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div><span className="text-slate-400">Đơn vị:</span> <span className="font-medium text-slate-700">{d.unit}</span></div>
              <div><span className="text-slate-400">Ngày gửi:</span> <span className="font-medium text-slate-700">{d.submittedDate}</span></div>
              <div className="col-span-2"><span className="text-slate-400">Người xử lý:</span> <span className="font-medium text-slate-700">{d.handler}</span></div>
            </div>
            <div className="pt-1">
              <button onClick={() => navigate(`/student/declarations/${d.id}`)} className="btn-secondary text-xs w-full justify-center py-2">Xem chi tiết</button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-hidden">
        <div className="table-responsive-wrapper">
          <table className="w-full min-w-[650px] text-sm">
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
    </div>
  )
}
