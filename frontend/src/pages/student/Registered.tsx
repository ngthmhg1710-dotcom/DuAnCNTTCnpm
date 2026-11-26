import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UnorderedListOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { cancelRegisterActivity, getSemesters, getStudentRegistrations, semesterOf, type RegisteredActivityItem, type Semester } from '../../lib/api'
import { drlPointsLabel } from '../../data/drl'

const shownStatus = (r: RegisteredActivityItem) => (r.cancelled ? 'Đã hủy' : r.status)

export default function StudentRegistered() {
  const navigate = useNavigate()
  const [registered, setRegistered] = useState<RegisteredActivityItem[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [semesterId, setSemesterId] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [toCancel, setToCancel] = useState<RegisteredActivityItem | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')

  const load = () => {
    setLoading(true)
    getStudentRegistrations()
      .then(setRegistered)
      .catch(() => { setRegistered([]); setToast('Không tải được danh sách đăng ký.') })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load(); getSemesters().then(setSemesters).catch(() => {}) }, [])

  const semesterLabel = (r: RegisteredActivityItem) => {
    const s = semesterOf(semesters, r.startAt)
    return s ? `${s.name} ${s.year}` : '—'
  }

  const filtered = registered.filter(r =>
    (!filterStatus || shownStatus(r) === filterStatus) &&
    (!semesterId || semesterOf(semesters, r.startAt)?.id === Number(semesterId))
  )

  const confirmCancel = async () => {
    if (!toCancel) return
    setBusy(true)
    try {
      await cancelRegisterActivity(toCancel.activityId)
      setToast('Đã hủy đăng ký.')
      load()
    } catch (e: any) {
      setToast(e?.response?.data?.message?.toString() || 'Hủy đăng ký thất bại.')
    } finally {
      setBusy(false)
      setToCancel(null)
    }
  }

  const cancelButton = (r: RegisteredActivityItem, className: string) =>
    r.canCancel ? <button onClick={() => setToCancel(r)} className={`${className} text-red-600 border-red-200 hover:bg-red-50`}>Hủy đăng ký</button> : null

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Hoạt động đã đăng ký</h1>
        <p className="text-slate-500 text-sm mt-1">Danh sách các hoạt động bạn đã đăng ký tham gia. Chỉ hủy được khi hoạt động chưa bắt đầu.</p>
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select className="select w-full sm:w-auto" aria-label="Lọc theo trạng thái" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {['Đã đăng ký', 'Đã tham gia', 'Vắng', 'Đã hủy'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="select w-full sm:w-auto" aria-label="Lọc theo học kỳ" value={semesterId} onChange={e => setSemesterId(e.target.value)}>
            <option value="">Tất cả học kỳ</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name} {s.year}</option>)}
          </select>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'list'
                ? 'bg-blue-600 !text-white '
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Chế độ danh sách (Bảng)"
          >
            <UnorderedListOutlined />
            <span>Danh sách</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-blue-600 !text-white '
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Chế độ thẻ"
          >
            <AppstoreOutlined />
            <span>Dạng thẻ</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-slate-400 text-sm">Đang tải...</div>
      ) : viewMode === 'grid' ? (
        /* Grid / Card View with Banner Images */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-full card p-8 text-center text-slate-400 text-sm">
              Chưa có hoạt động nào được đăng ký
            </div>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-lg overflow-hidden border border-slate-200/80 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  {r.imageUrl ? (
                    <div className="relative h-44 overflow-hidden bg-slate-900">
                      <img src={r.imageUrl} alt={r.activity} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                        <span className="bg-white/95 text-slate-900 font-bold text-xs px-3 py-1 rounded-full ">
                          {r.category || 'Hoạt động SV'}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 ">{statusBadge(shownStatus(r))}</div>
                    </div>
                  ) : (
                    <div className="relative h-28 bg-blue-600 p-4 flex justify-between items-start shrink-0">
                      <span className="bg-white/20 text-white border-0 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {r.category || 'Hoạt động SV'}
                      </span>
                      <div>{statusBadge(shownStatus(r))}</div>
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {r.activity}
                    </h3>
                    {r.points ? (
                      <p className="text-xs text-emerald-700">
                        <strong>+{r.points} điểm</strong> rèn luyện · cộng vào {drlPointsLabel(r.points, r.category, r.ruleCode)?.section}
                        {r.cancelled ? ' (hoạt động đã hủy, không được tính)' : r.status === 'Đã tham gia' ? ' (đã được tính)' : ' (khi được xác nhận tham gia)'}
                      </p>
                    ) : null}

                    <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <ClockCircleOutlined className="text-slate-400 shrink-0" />
                        <span>Thời gian: <strong className="text-slate-700">{r.time}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <EnvironmentOutlined className="text-slate-400 shrink-0" />
                        <span className="truncate">Địa điểm: <strong className="text-slate-700">{r.location}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarOutlined className="text-slate-400 shrink-0" />
                        <span className="truncate">Ngày đăng ký: <strong className="text-slate-700">{r.registeredDate}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium">{semesterLabel(r)}</span>
                  <div className="flex items-center gap-3">
                    {cancelButton(r, 'btn-secondary text-xs py-1 px-2')}
                    <button
                      onClick={() => navigate(`/student/activities/${r.activityId}`)}
                      className="text-blue-600 hover:text-blue-800 font-bold transition-colors flex items-center gap-1"
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* List / Table View */
        <div className="card overflow-hidden">
          <div className="table-responsive-wrapper">
            <table className="w-full min-w-[750px] text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-4 py-3">Hoạt động</th>
                  <th className="text-left px-4 py-3">Thời gian</th>
                  <th className="text-left px-4 py-3">Địa điểm</th>
                  <th className="text-left px-4 py-3">Học kỳ</th>
                  <th className="text-left px-4 py-3">Ngày đăng ký</th>
                  <th className="text-left px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Chưa có hoạt động nào được đăng ký
                    </td>
                  </tr>
                ) : (
                  filtered.map(r => (
                    <tr key={r.id} className="table-row">
                      <td className="px-4 py-3 font-medium text-slate-800 whitespace-normal">{r.activity}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs whitespace-normal">{r.time}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{r.location}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{semesterLabel(r)}</td>
                      <td className="px-4 py-3 text-slate-600">{r.registeredDate}</td>
                      <td className="px-4 py-3">{statusBadge(shownStatus(r))}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          {cancelButton(r, 'btn-secondary text-xs py-1')}
                          <button onClick={() => navigate(`/student/activities/${r.activityId}`)} className="btn-secondary text-xs py-1">Xem</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toCancel && (
        <Modal title="Hủy đăng ký" onClose={() => setToCancel(null)}>
          <p className="text-slate-600 text-sm mb-4">Hủy đăng ký hoạt động <strong>"{toCancel.activity}"</strong>? Suất của bạn sẽ được trả lại cho sinh viên khác.</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setToCancel(null)} disabled={busy} className="btn-secondary">Giữ đăng ký</button>
            <button onClick={confirmCancel} disabled={busy} className="btn-danger">{busy ? 'Đang xử lý...' : 'Hủy đăng ký'}</button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
