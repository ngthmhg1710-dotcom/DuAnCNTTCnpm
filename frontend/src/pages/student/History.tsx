import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { statusBadge } from '../../components/ui/Badge'
import { getSemesters, getStudentHistory, semesterOf, type HistoryItem, type Semester } from '../../lib/api'

const typeColor: Record<string, string> = {
  'Khai báo': 'bg-purple-50 text-purple-600',
  'Tham gia': 'bg-green-50 text-green-600',
}

export default function StudentHistory() {
  const navigate = useNavigate()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [semesterId, setSemesterId] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    getStudentHistory()
      .then(setItems)
      .catch(() => setError('Không tải được lịch sử. Vui lòng thử lại.'))
      .finally(() => setLoading(false))
    getSemesters().then(setSemesters).catch(() => {})
  }, [])

  const statuses = [...new Set(items.map(i => i.status))]
  const filtered = items.filter(h =>
    (!type || h.type === type) &&
    (!status || h.status === status) &&
    (!semesterId || semesterOf(semesters, h.date)?.id === Number(semesterId))
  )
  const earned = filtered.reduce((sum, h) => sum + (h.points ?? 0), 0)

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Lịch sử hoạt động</h1>
        <p className="text-slate-500 text-sm mt-1">Toàn bộ lịch sử đăng ký, tham gia và khai báo của bạn</p>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>

      <div className="card mb-4 p-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <select className="select w-full sm:w-auto" aria-label="Lọc theo học kỳ" value={semesterId} onChange={e => setSemesterId(e.target.value)}>
          <option value="">Tất cả học kỳ</option>
          {semesters.map(s => <option key={s.id} value={s.id}>{s.name} {s.year}</option>)}
        </select>
        <select className="select w-full sm:w-auto" aria-label="Lọc theo loại" value={type} onChange={e => setType(e.target.value)}>
          <option value="">Tất cả loại</option>
          <option>Tham gia</option>
          <option>Khai báo</option>
        </select>
        <select className="select w-full sm:w-auto" aria-label="Lọc theo trạng thái" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        {(semesterId || type || status) && (
          <button onClick={() => { setSemesterId(''); setType(''); setStatus('') }} className="btn-secondary text-xs">Xóa bộ lọc</button>
        )}
      </div>

      <div className="card">
        <div className="divide-y divide-slate-50">
          {loading && <div className="px-5 py-10 text-center text-slate-400 text-sm">Đang tải...</div>}
          {!loading && filtered.map((h, i) => (
            <div key={`${h.type}-${h.code ?? h.activityId}-${i}`} className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${h.type === 'Tham gia' ? 'bg-green-500' : 'bg-purple-500'}`} />
                <div className="text-xs text-slate-400 w-24 shrink-0 font-mono">{new Date(h.date).toLocaleDateString('vi-VN')}</div>
              </div>
              <button
                onClick={() => navigate(h.type === 'Khai báo' ? `/student/declarations/${h.code}` : `/student/activities/${h.activityId}`)}
                className="flex-1 text-left text-sm text-slate-700 font-medium hover:text-blue-600"
              >
                {h.event}
                {h.points ? <span className="ml-2 text-xs font-semibold text-emerald-700">+{h.points} điểm</span> : null}
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`badge text-xs ${typeColor[h.type]}`}>{h.type}</span>
                {statusBadge(h.status)}
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-slate-400 text-sm">Chưa có lịch sử nào</div>
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
            {filtered.length} mục · Điểm rèn luyện từ các hoạt động đã tham gia: <strong className="text-emerald-700">+{earned}</strong> (điểm tham khảo, mỗi mục tối đa 20 điểm theo quy chế)
          </div>
        )}
      </div>
    </div>
  )
}
