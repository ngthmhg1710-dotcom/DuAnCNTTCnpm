import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { downloadFile, getStudents, importStudentsFile, type StudentSummary } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'
import ImportResult, { type ImportResultData } from '../../components/ui/ImportResult'

const PAGE_SIZE = 10

export default function StaffStudents() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [imported, setImported] = useState<ImportResultData | null>(null)
  const [className, setClassName] = useState('')
  const [cohort, setCohort] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    getStudents().then(setStudents).catch(() => setError('Không tải được danh sách (phiên đăng nhập hết hạn hoặc lỗi server). Hãy đăng nhập lại.')).finally(() => setLoading(false))
  }, [])

  const onFile = async (file?: File) => {
    if (!file) return
    setImported(await importStudentsFile(file))
    setStudents(await getStudents())
  }

  const q = search.trim().toLowerCase()
  const filtered = students.filter(s =>
    (s.name.toLowerCase().includes(q) || s.mssv.toLowerCase().includes(q)) &&
    (!className || s.className === className) &&
    (!cohort || s.cohort === cohort) &&
    (!status || s.status === status)
  )
  const options = (key: 'className' | 'cohort' | 'status') =>
    [...new Set(students.map(s => s[key]).filter(Boolean) as string[])].sort()
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  // Đổi bộ lọc thì quay về trang 1
  const filter = (set: (v: string) => void) => (e: { target: { value: string } }) => { set(e.target.value); setPage(1) }

  return (
    <div className="page-container">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý sinh viên</h1>
          <p className="text-slate-500 text-sm mt-1">{students.length} sinh viên</p>
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button onClick={() => downloadFile('/students/export', 'sinh-vien.xlsx')} className="btn-secondary">Xuất Excel</button>
          <a href="/mau-import-sinh-vien.csv" download className="btn-secondary">Tải file mẫu</a>
          <label className="btn-primary cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" hidden onChange={e => { onFile(e.target.files?.[0]); e.target.value = '' }} />
          </label>
        </div>
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <input className="input w-full sm:w-auto sm:max-w-xs" placeholder="Tìm theo tên, MSSV..." value={search} onChange={filter(setSearch)} />
        <select className="select w-full sm:w-auto" aria-label="Lọc theo lớp" value={className} onChange={filter(setClassName)}>
          <option value="">Tất cả lớp</option>
          {options('className').map(v => <option key={v}>{v}</option>)}
        </select>
        <select className="select w-full sm:w-auto" aria-label="Lọc theo khóa" value={cohort} onChange={filter(setCohort)}>
          <option value="">Tất cả khóa</option>
          {options('cohort').map(v => <option key={v}>{v}</option>)}
        </select>
        <select className="select w-full sm:w-auto" aria-label="Lọc theo trạng thái" value={status} onChange={filter(setStatus)}>
          <option value="">Tất cả trạng thái</option>
          {options('status').map(v => <option key={v}>{v}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">MSSV</th>
              <th className="text-left px-4 py-3">Họ tên</th>
              <th className="text-left px-4 py-3">Lớp</th>
              <th className="text-left px-4 py-3">Khóa</th>
              <th className="text-left px-4 py-3">Ngành</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-left px-4 py-3">Số HĐ</th>
              <th className="text-left px-4 py-3">Mức tham gia</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && (
              <tr><td colSpan={9} className="text-center py-10 text-slate-400">Đang tải...</td></tr>
            )}
            {!loading && pageRows.map(s => (
              <tr key={s.id} className="table-row">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.mssv}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.className ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{s.cohort ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{s.major ?? '—'}</td>
                <td className="px-4 py-3">{statusBadge(s.status)}</td>
                <td className="px-4 py-3 text-slate-600">{s.activities}</td>
                <td className="px-4 py-3">{statusBadge(s.participation)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/staff/students/${s.id}`)} className="btn-secondary text-xs py-1">Xem chi tiết</button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={9} className="text-center py-10 text-slate-400">Không tìm thấy sinh viên</td></tr>
            )}
          </tbody>
        </table>
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
            <span>{(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} / {filtered.length} sinh viên</span>
            <div className="flex items-center gap-2">
              <button className="btn-secondary text-xs py-1 px-2" disabled={current <= 1} onClick={() => setPage(current - 1)}>‹ Trước</button>
              <span>Trang {current}/{pages}</span>
              <button className="btn-secondary text-xs py-1 px-2" disabled={current >= pages} onClick={() => setPage(current + 1)}>Sau ›</button>
            </div>
          </div>
        )}
      </div>
      {imported && <ImportResult result={imported} onClose={() => setImported(null)} />}
    </div>
  )
}
