import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudents, importStudents, type StudentSummary } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'

export default function StaffStudents() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getStudents().then(setStudents).catch(() => setError('Không tải được danh sách (phiên đăng nhập hết hạn hoặc lỗi server). Hãy đăng nhập lại.')).finally(() => setLoading(false))
  }, [])

  // CSV (UTF-8, dòng đầu là tiêu đề): mssv,name,email,className,cohort,major
  // ponytail: split theo dấu phẩy, không hỗ trợ ô có dấu phẩy/ngoặc kép; dùng thư viện CSV nếu cần.
  const onFile = async (file?: File) => {
    if (!file) return
    const [head, ...lines] = (await file.text()).replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim())
    const keys = head.split(',').map(k => k.trim())
    const rows = lines.map(l => Object.fromEntries(l.split(',').map((v, i) => [keys[i], v.trim()])))
    try {
      const r = await importStudents(rows)
      alert(`Thêm mới ${r.created}, cập nhật ${r.updated}, lỗi ${r.errors.length}` + (r.errors.length ? '\n' + r.errors.slice(0, 10).join('\n') : ''))
      setStudents(await getStudents())
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Import thất bại')
    }
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.mssv.includes(search)
  )

  return (
    <div className="page-container">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý sinh viên</h1>
          <p className="text-slate-500 text-sm mt-1">{students.length} sinh viên</p>
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <a href="/mau-import-sinh-vien.csv" download className="btn-secondary">Tải file mẫu</a>
          <label className="btn-primary cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" hidden onChange={e => { onFile(e.target.files?.[0]); e.target.value = '' }} />
          </label>
        </div>
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <input className="input w-full sm:w-auto sm:max-w-xs" placeholder="Tìm theo tên, MSSV..." value={search} onChange={e => setSearch(e.target.value)} />
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
            {!loading && filtered.map(s => (
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
      </div>
    </div>
  )
}
