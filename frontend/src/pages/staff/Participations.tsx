import { useEffect, useState } from 'react'
import { getActivities, getParticipations, importAttendanceFile, updateParticipationStatus, type Activity, type ParticipationRow } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'

const STATUS_LABEL: Record<string, string> = {
  REGISTERED: 'Đã đăng ký',
  ATTENDED: 'Đã tham gia',
  ABSENT: 'Vắng',
}

export default function StaffParticipations() {
  const [rows, setRows] = useState<ParticipationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [activityId, setActivityId] = useState('')
  const [result, setResult] = useState<Awaited<ReturnType<typeof importAttendanceFile>> | null>(null)

  useEffect(() => {
    getParticipations().then(setRows).finally(() => setLoading(false))
    getActivities().then(setActivities)
  }, [])

  const onFile = async (file?: File) => {
    if (!file || !activityId) return
    setResult(await importAttendanceFile(Number(activityId), file))
    setRows(await getParticipations())
  }

  const setStatus = async (id: number, status: ParticipationRow['status']) => {
    try {
      await updateParticipationStatus(id, status)
      setRows(rs => rs.map(r => (r.id === id ? { ...r, status } : r)))
    } catch {
      alert('Không cập nhật được trạng thái. Vui lòng thử lại.')
    }
  }

  const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.mssv.includes(search))

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý tham gia</h1>
        <p className="text-slate-500 text-sm mt-1">Điểm danh: đổi trạng thái sang Đã tham gia hoặc Vắng sau khi hoạt động diễn ra</p>
      </div>

      <div className="card mb-5 p-4">
        <div className="font-semibold text-slate-800 mb-1">Import điểm danh từ Google Sheet</div>
        <p className="text-slate-500 text-sm mb-3">Chọn hoạt động, rồi chọn file CSV tải từ Google Sheet (cột MSSV). Sinh viên có trong file sẽ chuyển sang "Đã tham gia".</p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center">
          <select className="select w-full sm:w-auto sm:min-w-[260px]" value={activityId} onChange={e => setActivityId(e.target.value)}>
            <option value="">-- Chọn hoạt động --</option>
            {activities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
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
                  <div className="flex items-center gap-2">
                    {statusBadge(STATUS_LABEL[r.status])}
                    <select className="select text-xs py-1" value={r.status} onChange={e => setStatus(r.id, e.target.value as ParticipationRow['status'])}>
                      {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
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
    </div>
  )
}
