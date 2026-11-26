import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActivities, getSemesters, semesterOf, updateActivity, deleteActivity, type Activity, type Semester } from '../../lib/api'
import { DRL_SECTIONS } from '../../data/drl'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

type Action = 'publish' | 'close' | 'reopen' | 'cancel' | 'restore' | 'delete'

const ACTIONS: Record<Action, { title: string; confirm: string; done: string; danger?: boolean; text: (t: string) => string }> = {
  publish: { title: 'Xác nhận công bố hoạt động', confirm: 'Xác nhận công bố', done: 'Đã công bố hoạt động!', text: t => `Công bố hoạt động "${t}" cho sinh viên đăng ký?` },
  close: { title: 'Đóng đăng ký', confirm: 'Đóng đăng ký', done: 'Đã đóng đăng ký.', text: t => `Đóng đăng ký "${t}"? Sinh viên đã đăng ký vẫn giữ nguyên, nhưng không ai đăng ký thêm được.` },
  reopen: { title: 'Mở lại đăng ký', confirm: 'Mở lại', done: 'Đã mở lại đăng ký.', text: t => `Mở lại đăng ký cho "${t}"?` },
  cancel: { title: 'Hủy hoạt động', confirm: 'Xác nhận hủy', done: 'Đã hủy hoạt động.', danger: true, text: t => `Hủy hoạt động "${t}"? Lịch sử đăng ký được giữ lại nhưng hoạt động sẽ không được tính điểm rèn luyện.` },
  restore: { title: 'Khôi phục hoạt động', confirm: 'Khôi phục', done: 'Đã khôi phục hoạt động.', text: t => `Khôi phục hoạt động "${t}"?` },
  delete: { title: 'Xác nhận xóa hoạt động', confirm: 'Xác nhận xóa', done: 'Đã xóa hoạt động!', danger: true, text: t => `Xóa vĩnh viễn "${t}"? Chỉ xóa được khi chưa có sinh viên đăng ký.` },
}

const day = (iso: string) => new Date(iso).toISOString().slice(0, 10)

export default function StaffActivities() {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [semesterId, setSemesterId] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [pending, setPending] = useState<{ id: number; action: Action } | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')

  const load = () => {
    setLoading(true)
    getActivities().then(setActivities).finally(() => setLoading(false))
  }
  useEffect(() => { load(); getSemesters().then(setSemesters).catch(() => {}) }, [])

  const categories = useMemo(() => [...new Set([...DRL_SECTIONS.map(s => s.name), ...activities.map(a => a.category)])], [activities])

  const filtered = activities.filter(a =>
    a.title.toLowerCase().includes(search.trim().toLowerCase()) &&
    (!category || a.category === category) &&
    (!status || a.status === status) &&
    (!semesterId || semesterOf(semesters, a.startAt)?.id === Number(semesterId)) &&
    (!from || day(a.startAt) >= from) &&
    (!to || day(a.startAt) <= to)
  )
  const hasFilter = search || category || semesterId || status || from || to
  const clearFilters = () => { setSearch(''); setCategory(''); setSemesterId(''); setStatus(''); setFrom(''); setTo('') }

  const run = async () => {
    if (!pending) return
    const { id, action } = pending
    setBusy(true)
    try {
      if (action === 'delete') await deleteActivity(id)
      else await updateActivity(id, {
        publish: { published: true }, close: { closed: true }, reopen: { closed: false }, cancel: { cancelled: true }, restore: { cancelled: false },
      }[action])
      setToast(ACTIONS[action].done)
      load()
    } catch (e: any) {
      setToast(e?.response?.data?.message?.toString() || 'Thao tác thất bại.')
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  const buttons = (a: Activity, compact: boolean) => {
    const sm = compact ? 'btn-secondary text-xs flex-1 justify-center py-2' : 'btn-secondary text-xs py-1 px-2'
    const primary = compact ? 'btn-primary text-xs flex-1 justify-center py-2' : 'btn-primary text-xs py-1 px-2'
    const red = `${sm} text-red-600 border-red-200`
    const go = (action: Action) => () => setPending({ id: a.id, action })
    return (
      <>
        <button onClick={() => navigate(`/staff/activities/${a.id}`)} className={sm}>Xem</button>
        <button onClick={() => navigate(`/staff/activities/${a.id}/edit`)} className={sm}>Sửa</button>
        {a.status === 'Nháp' && <button onClick={go('publish')} className={primary}>Công bố</button>}
        {a.status === 'Đang mở' && <button onClick={go('close')} className={sm}>Đóng ĐK</button>}
        {a.status === 'Đóng đăng ký' && <button onClick={go('reopen')} className={sm}>Mở ĐK</button>}
        {a.status === 'Đã hủy'
          ? <button onClick={go('restore')} className={sm}>Khôi phục</button>
          : a.registered > 0 || a.status !== 'Nháp'
            ? <button onClick={go('cancel')} className={red}>Hủy</button>
            : <button onClick={go('delete')} className={red}>Xóa</button>}
      </>
    )
  }

  const target = pending && activities.find(a => a.id === pending.id)

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý hoạt động</h1>
          <p className="text-slate-500 text-sm mt-1">{hasFilter ? `${filtered.length}/${activities.length}` : activities.length} hoạt động</p>
        </div>
        <button onClick={() => navigate('/staff/activities/create')} className="btn-primary self-start sm:self-auto">+ Tạo hoạt động</button>
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row gap-3 flex-wrap items-stretch sm:items-center">
        <input className="input w-full sm:w-auto sm:max-w-xs" placeholder="Tìm theo tên..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select w-full sm:w-auto" aria-label="Lọc theo mục" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Tất cả loại</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="select w-full sm:w-auto" aria-label="Lọc theo học kỳ" value={semesterId} onChange={e => setSemesterId(e.target.value)}>
          <option value="">Tất cả học kỳ</option>
          {semesters.map(s => <option key={s.id} value={s.id}>{s.name} {s.year}</option>)}
        </select>
        <select className="select w-full sm:w-auto" aria-label="Lọc theo trạng thái" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {['Nháp', 'Đang mở', 'Đóng đăng ký', 'Đã kết thúc', 'Đã hủy'].map(s => <option key={s}>{s}</option>)}
        </select>
        <label className="flex items-center gap-2 text-xs text-slate-500">Từ
          <input type="date" className="input !w-auto" value={from} max={to || undefined} onChange={e => setFrom(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-500">đến
          <input type="date" className="input !w-auto" value={to} min={from || undefined} onChange={e => setTo(e.target.value)} />
        </label>
        {hasFilter && <button onClick={clearFilters} className="btn-secondary text-xs">Xóa bộ lọc</button>}
      </div>

      {loading ? (
        <div className="card p-8 text-center text-slate-400 text-sm">Đang tải...</div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {filtered.map(a => (
              <div key={a.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-slate-800 text-sm leading-snug">{a.title}</div>
                  <div className="shrink-0">{statusBadge(a.status)}</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">{a.category}</span>
                  {a.unit && <span className="badge bg-slate-100 text-slate-600 border border-slate-200">{a.unit}</span>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div><span className="text-slate-400">Thời gian:</span> <span className="font-medium text-slate-700">{new Date(a.startAt).toLocaleDateString('vi-VN')}</span></div>
                  <div><span className="text-slate-400">Số lượng:</span> <span className="font-medium text-slate-700">{a.registered}/{a.capacity ?? '—'}</span></div>
                </div>
                <div className="pt-1 flex flex-wrap gap-2">{buttons(a, true)}</div>
              </div>
            ))}
            {filtered.length === 0 && <div className="card p-8 text-center text-slate-400 text-sm">Không có hoạt động nào</div>}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block card overflow-hidden">
            <div className="table-responsive-wrapper">
              <table className="w-full min-w-[750px] text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="text-left px-4 py-3">Tên hoạt động</th>
                    <th className="text-left px-4 py-3">Loại</th>
                    <th className="text-left px-4 py-3">Đơn vị</th>
                    <th className="text-left px-4 py-3">Thời gian</th>
                    <th className="text-left px-4 py-3">Đăng ký</th>
                    <th className="text-left px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(a => (
                    <tr key={a.id} className="table-row">
                      <td className="px-4 py-3 font-medium text-slate-800 min-w-[240px] max-w-md whitespace-normal leading-snug">
                        <div className="flex items-center gap-3">
                          {a.imageUrl ? (
                            <img src={a.imageUrl} alt={a.title} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 text-base">
                              🖼️
                            </div>
                          )}
                          <span className="font-semibold text-slate-800">{a.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{a.category}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{a.unit ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{new Date(a.startAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3 text-slate-600">{a.registered}/{a.capacity ?? '—'}</td>
                      <td className="px-4 py-3">{statusBadge(a.status)}</td>
                      <td className="px-4 py-3"><div className="flex gap-1 flex-wrap">{buttons(a, false)}</div></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-400">Không có hoạt động nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {pending && target && (
        <Modal title={ACTIONS[pending.action].title} onClose={() => setPending(null)}>
          <p className="text-slate-600 text-sm mb-4">{ACTIONS[pending.action].text(target.title)}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setPending(null)} disabled={busy} className="btn-secondary">Hủy bỏ</button>
            <button onClick={run} disabled={busy} className={ACTIONS[pending.action].danger ? 'btn-danger' : 'btn-primary'}>
              {busy ? 'Đang xử lý...' : ACTIONS[pending.action].confirm}
            </button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
