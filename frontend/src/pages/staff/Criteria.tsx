import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { statusBadge } from '../../components/ui/Badge'
import { Toast } from '../../components/ui/Toast'
import { deleteCriteria, getCriteria, getCriteriaSummary, getSemesters, type CriteriaRow, type CriteriaSummary, type Semester } from '../../lib/api'

export default function StaffCriteria() {
  const navigate = useNavigate()
  const [items, setItems] = useState<CriteriaRow[]>([])
  const [toast, setToast] = useState('')
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [semesterId, setSemesterId] = useState<number | undefined>()
  const [summary, setSummary] = useState<CriteriaSummary | null>(null)

  const load = () => getCriteria().then(setItems).catch(() => setToast('Không tải được danh sách tiêu chí.'))
  useEffect(() => { load(); getSemesters().then(setSemesters).catch(() => {}) }, [])
  useEffect(() => {
    getCriteriaSummary(semesterId).then(setSummary).catch(() => setToast('Không tải được điểm ước tính.'))
  }, [semesterId, items])

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
              <th className="text-left px-4 py-3">Điểm tối đa</th>
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
                <td className="px-4 py-3 text-slate-600">{c.points ?? 0}</td>
                <td className="px-4 py-3 text-slate-600">{c.activities}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{c.semester}</td>
                <td className="px-4 py-3">{statusBadge(c.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => navigate(`/staff/criteria/${c.id}`)} className="btn-secondary text-xs py-1 px-2">Xem chi tiết</button>
                    <button onClick={() => navigate(`/staff/criteria/${c.id}/edit`)} className="btn-secondary text-xs py-1 px-2">Sửa</button>
                    <button onClick={() => remove(c)} className="btn-secondary text-xs py-1 px-2 text-red-500">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-slate-500">Chưa có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
</div>
      </div>

      <div className="mt-8 mb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Điểm ước tính theo học kỳ</h2>
          <p className="text-amber-700 text-xs mt-1">⚠️ Điểm dự trù để tham khảo, tính từ hoạt động đã tham gia và cấu hình tiêu chí. Không phải điểm rèn luyện chính thức.</p>
        </div>
        <select className="select w-full sm:w-auto" aria-label="Chọn học kỳ" value={semesterId ?? summary?.semester?.id ?? ''}
          onChange={e => setSemesterId(Number(e.target.value) || undefined)}>
          {semesters.map(s => <option key={s.id} value={s.id}>{s.name} {s.year}{s.isCurrent ? ' (hiện tại)' : ''}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">MSSV</th>
                <th className="text-left px-4 py-3">Họ tên</th>
                <th className="text-left px-4 py-3">Lớp</th>
                <th className="text-left px-4 py-3">HĐ đã tham gia</th>
                {summary?.criteria.map(c => <th key={c.id} className="text-left px-4 py-3" title={c.name}>{c.group} <span className="font-normal text-slate-400">/{c.points}</span></th>)}
                <th className="text-left px-4 py-3">Tổng ước tính</th>
                <th className="text-left px-4 py-3">Xếp loại dự kiến</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {summary?.students.map(s => (
                <tr key={s.id} className="table-row">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.mssv}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.className ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.attended}</td>
                  {s.byCriteria.map((p, i) => <td key={i} className="px-4 py-3 text-slate-600">{p}</td>)}
                  <td className="px-4 py-3 font-semibold text-slate-800">{s.estimated}/{summary.maxTotal}</td>
                  <td className="px-4 py-3">{statusBadge(s.rank)}</td>
                </tr>
              ))}
              {summary && summary.students.length === 0 && (
                <tr><td colSpan={6 + summary.criteria.length} className="text-center py-10 text-slate-500">Chưa có sinh viên</td></tr>
              )}
              {summary && !summary.semester && (
                <tr><td colSpan={6} className="text-center py-10 text-slate-500">Chưa có học kỳ nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {summary && summary.criteria.length > 0 && summary.maxTotal === 0 && (
          <p className="px-4 py-3 text-xs text-slate-500 border-t border-slate-100">Các tiêu chí chưa đặt điểm tối đa nên tổng đều bằng 0. Bấm "Sửa" từng tiêu chí để nhập điểm.</p>
        )}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
