import { useNavigate } from 'react-router-dom'
import { criteria } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'

export default function StaffCriteria() {
  const navigate = useNavigate()
  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý tiêu chí</h1>
          <p className="text-slate-500 text-sm mt-1">Cấu hình tiêu chí hoạt động theo học kỳ</p>
        </div>
        <button onClick={() => navigate('/staff/criteria/create')} className="btn-primary">+ Thêm tiêu chí</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">Nhóm</th>
              <th className="text-left px-4 py-3">Tiêu chí</th>
              <th className="text-left px-4 py-3">Mức yêu cầu</th>
              <th className="text-left px-4 py-3">Cách tính</th>
              <th className="text-left px-4 py-3">Hoạt động LQ</th>
              <th className="text-left px-4 py-3">Học kỳ</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {criteria.map(c => (
              <tr key={c.id} className="table-row">
                <td className="px-4 py-3 text-slate-700 font-medium">{c.group}</td>
                <td className="px-4 py-3 text-slate-700">{c.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.requirement} lần</td>
                <td className="px-4 py-3 text-slate-600">{c.method}</td>
                <td className="px-4 py-3 text-slate-600">{c.activities}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{c.semester}</td>
                <td className="px-4 py-3">{statusBadge(c.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="btn-secondary text-xs py-1 px-2">Sửa</button>
                    <button className="btn-secondary text-xs py-1 px-2 text-red-500">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
