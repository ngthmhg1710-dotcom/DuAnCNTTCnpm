import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { statusBadge } from '../../components/ui/Badge'
import { Toast } from '../../components/ui/Toast'
import { deleteCriteria, getCriteria, type CriteriaRow } from '../../lib/api'

export default function StaffCriteria() {
  const navigate = useNavigate()
  const [items, setItems] = useState<CriteriaRow[]>([])
  const [toast, setToast] = useState('')

  const load = () => getCriteria().then(setItems).catch(() => setToast('Không tải được danh sách tiêu chí.'))
  useEffect(() => { load() }, [])

  const remove = async (c: CriteriaRow) => {
    if (!confirm(`Xóa tiêu chí "${c.name}"?`)) return
    try { await deleteCriteria(c.id); setToast('Đã xóa tiêu chí.'); load() }
    catch { setToast('Xóa thất bại.') }
  }

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
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">Nhóm</th>
              <th className="text-left px-4 py-3">Tiêu chí</th>
              <th className="text-left px-4 py-3">Mức yêu cầu</th>
              <th className="text-left px-4 py-3">Hoạt động LQ</th>
              <th className="text-left px-4 py-3">Học kỳ</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map(c => (
              <tr key={c.id} className="table-row">
                <td className="px-4 py-3 text-slate-700 font-medium">{c.group}</td>
                <td className="px-4 py-3 text-slate-700">{c.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.requirement} lần</td>
                <td className="px-4 py-3 text-slate-600">{c.activities}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{c.semester}</td>
                <td className="px-4 py-3">{statusBadge(c.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => navigate(`/staff/criteria/${c.id}/edit`)} className="btn-secondary text-xs py-1 px-2">Sửa</button>
                    <button onClick={() => remove(c)} className="btn-secondary text-xs py-1 px-2 text-red-500">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-slate-500">Chưa có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
</div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
