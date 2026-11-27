import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Toast } from '../../components/ui/Toast'
import { getActivities, getParticipations, importAttendanceFile, updateParticipationStatus, type Activity, type ParticipationRow } from '../../lib/api'

const STATUS_LABEL: Record<string, string> = {
  REGISTERED: 'Đã đăng ký',
  ATTENDED: 'Đã tham gia',
  ABSENT: 'Vắng',
}
const CANCEL = 'CANCELLED'

export default function StaffParticipations() {
  // Mở từ trang chi tiết hoạt động thì đã chọn sẵn hoạt động đó: /staff/participations?activityId=...
  const [params, setParams] = useSearchParams()
  const [rows, setRows] = useState<ParticipationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [result, setResult] = useState<Awaited<ReturnType<typeof importAttendanceFile>> | null>(null)
  const [toast, setToast] = useState('')
  const activityId = params.get('activityId') ?? ''
  const activity = activities.find(a => String(a.id) === activityId)

  const load = () => getParticipations(activityId ? { activityId: Number(activityId) } : undefined)
    .then(setRows)
    .catch(() => setToast('Không tải được danh sách tham gia.'))
    .finally(() => setLoading(false))

  useEffect(() => { getActivities().then(setActivities).catch(() => {}) }, [])
  useEffect(() => { setLoading(true); load() }, [activityId])

  const pickActivity = (id: string) => {
    setResult(null)
    setParams(id ? { activityId: id } : {})
  }

  const onFile = async (file?: File) => {
    if (!file || !activityId) return
    setResult(await importAttendanceFile(Number(activityId), file))
    load()
  }

  const change = async (r: ParticipationRow, next: ParticipationRow['status'] | typeof CANCEL) => {
    if (next === CANCEL && !confirm(`Hủy đăng ký của ${r.name} (${r.mssv}) khỏi "${r.activity}"? Suất sẽ được trả lại.`)) return
    try {
      await updateParticipationStatus(r.id, next as ParticipationRow['status'])
      if (next === CANCEL) setRows(rs => rs.filter(x => x.id !== r.id))
      else setRows(rs => rs.map(x => (x.id === r.id ? { ...x, status: next as ParticipationRow['status'] } : x)))
      setToast(next === CANCEL ? 'Đã hủy đăng ký.' : `Đã chuyển ${r.mssv} sang "${STATUS_LABEL[next]}".`)
    } catch (e: any) {
      setToast(e?.response?.data?.message?.toString() || 'Không cập nhật được trạng thái. Vui lòng thử lại.')
    }
  }

  const q = search.trim().toLowerCase()
  const filtered = rows.filter(r =>
    (!q || r.name.toLowerCase().includes(q) || r.mssv.toLowerCase().includes(q)) &&
    (!status || r.status === status)
  )
  const count = (s: string) => rows.filter(r => r.status === s).length

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý tham gia</h1>
        <p className="text-slate-500 text-sm mt-1">Điểm danh: đổi trạng thái sang Đã tham gia hoặc Vắng sau khi hoạt động diễn ra. Mọi thay đổi đều được ghi vào Audit Log.</p>
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <select className="select w-full sm:w-auto sm:min-w-[260px]" aria-label="Chọn hoạt động" value={activityId} onChange={e => pickActivity(e.target.value)}>
          <option value="">Tất cả hoạt động</option>
          {activities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
        <select className="select w-full sm:w-auto" aria-label="Lọc theo trạng thái" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input className="input w-full sm:w-auto sm:max-w-xs" placeholder="Tìm theo tên, MSSV..." value={search} onChange={e => setSearch(e.target.value)} />
        {(activityId || status || search) && (
          <button onClick={() => { pickActivity(''); setStatus(''); setSearch('') }} className="btn-secondary text-xs">Xóa bộ lọc</button>
        )}
      </div>

      <div className="card mb-5 p-4">
        <div className="font-semibold text-slate-800 mb-1">Import điểm danh từ Google Sheet</div>
        <p className="text-slate-500 text-sm mb-3">
          {activity
            ? <>Hoạt động đang chọn: <strong>{activity.title}</strong>. Chọn file CSV tải từ Google Sheet (cột MSSV); sinh viên có trong file sẽ chuyển sang "Đã tham gia".</>
            : 'Chọn một hoạt động ở trên trước, rồi chọn file CSV tải từ Google Sheet (cột MSSV).'}
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center">
          <label className={`btn-primary ${activityId ? 'cursor-pointer' : 'opacity-50 pointer-events-none'}`}>
            Import điểm danh (CSV)
            <input type="file" accept=".csv" hidden onChange={e => { onFile(e.target.files?.[0]); e.target.value = '' }} />
          </label>
          <a href="/mau-diem-danh.csv" download className="btn-secondary">Tải file mẫu</a>
        </div>
        {result && (
          <div className="mt-3 text-sm">
            <div className="font-medium text-slate-800">Đã xác nhận tham gia: {result.updated} sinh viên đã đăng ký, {result.created} sinh viên đến thẳng; {result.errors.length} lỗi.</div>
            {result.errors.slice(0, 10).map(e => <div key={e} className="text-red-600">{e}</div>)}
          </div>
        )}
      </div>

      {!loading && (
        <p className="text-xs text-slate-500 mb-2">
          {rows.length} lượt · Đã đăng ký {count('REGISTERED')} · Đã tham gia {count('ATTENDED')} · Vắng {count('ABSENT')}
          {filtered.length !== rows.length && ` · đang hiển thị ${filtered.length}`}
        </p>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">MSSV</th>
              <th className="text-left px-4 py-3">Họ tên</th>
              <th className="text-left px-4 py-3">Hoạt động</th>
              <th className="text-left px-4 py-3">Ngày đăng ký</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">Đang tải...</td></tr>
            )}
            {!loading && filtered.map(r => (
              <tr key={r.id} className="table-row">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.mssv}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                <td className="px-4 py-3 text-slate-600">{r.activity}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(r.registeredAt).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3">
                  <select
                    className={`table-status-select ${r.status === 'ATTENDED' ? 'status-open' : r.status === 'ABSENT' ? 'status-ended' : 'status-neutral'}`}
                    aria-label={`Trạng thái của ${r.name}`}
                    value={r.status}
                    onChange={e => change(r, e.target.value as ParticipationRow['status'] | typeof CANCEL)}
                  >
                    {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    <option value={CANCEL}>Hủy đăng ký</option>
                  </select>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">Không có dữ liệu tham gia</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
