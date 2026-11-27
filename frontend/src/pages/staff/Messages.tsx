import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getActivities, getAudience, getMessageStatus, getMessageTemplates, sendMessage,
  type Activity, type AudienceStudent, type MessageStatus, type MessageTemplate, type SendMessageResult,
} from '../../lib/api'
import { Toast } from '../../components/ui/Toast'

const STATUS_LABEL = { REGISTERED: 'Đã đăng ký', ATTENDED: 'Đã tham gia', ABSENT: 'Vắng' } as const
const PROVIDER_LABEL = { smtp: 'Gmail/SMTP', brevo: 'Brevo', 'dry-run': 'Chạy thử (không gửi thật)' } as const
const VARS = ['{ten}', '{hoatdong}', '{thoigian}', '{diadiem}']
const when = (iso: string) => new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })

export default function StaffMessages() {
  const [params] = useSearchParams()
  const [activities, setActivities] = useState<Activity[]>([])
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [status, setStatus] = useState<MessageStatus | null>(null)
  const [actIds, setActIds] = useState<number[]>(() => (params.get('activityId') ? [Number(params.get('activityId'))] : []))
  const [actSearch, setActSearch] = useState('')
  const [audience, setAudience] = useState<AudienceStudent[]>([])
  const [picked, setPicked] = useState<Set<number>>(new Set())
  const [stuSearch, setStuSearch] = useState('')
  const [partStatus, setPartStatus] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [app, setApp] = useState(true)
  const [email, setEmail] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendMessageResult | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    getActivities().then(setActivities).catch(() => setToast('Không tải được danh sách hoạt động.'))
    getMessageTemplates().then(t => { setTemplates(t); const first = t[0]; if (first) { setTemplateId(first.id); setSubject(first.subject); setBody(first.body) } }).catch(() => {})
    getMessageStatus().then(setStatus).catch(() => {})
  }, [])

  // Đổi hoạt động đã chọn: tải lại danh sách sinh viên, chọn sẵn tất cả.
  useEffect(() => {
    if (!actIds.length) { setAudience([]); setPicked(new Set()); return }
    getAudience(actIds).then(a => { setAudience(a); setPicked(new Set(a.filter(s => s.active).map(s => s.studentId))) }).catch(() => setToast('Không tải được danh sách sinh viên.'))
  }, [actIds])

  const visibleActs = useMemo(() => {
    const q = actSearch.trim().toLowerCase()
    return activities.filter(a => !q || a.title.toLowerCase().includes(q)).sort((x, y) => +new Date(y.startAt) - +new Date(x.startAt))
  }, [activities, actSearch])

  const visibleStudents = useMemo(() => {
    const q = stuSearch.trim().toLowerCase()
    return audience.filter(s =>
      (!partStatus || s.activities.some(a => a.status === partStatus)) &&
      (!q || s.mssv.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || (s.className ?? '').toLowerCase().includes(q)))
  }, [audience, stuSearch, partStatus])

  const toggleAct = (id: number) => setActIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]))
  const toggleStu = (id: number) => setPicked(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const allVisiblePicked = visibleStudents.length > 0 && visibleStudents.every(s => picked.has(s.studentId))
  const toggleAllVisible = () => setPicked(p => { const n = new Set(p); visibleStudents.forEach(s => (allVisiblePicked ? n.delete(s.studentId) : n.add(s.studentId))); return n })

  const pickTemplate = (id: string) => {
    setTemplateId(id)
    const t = templates.find(x => x.id === id)
    if (t) { setSubject(t.subject); setBody(t.body) }
  }

  // Xem trước theo sinh viên đầu tiên được chọn.
  const sample = audience.find(s => picked.has(s.studentId))
  const preview = (text: string) => {
    if (!sample) return text
    const acts = sample.activities.map(a => activities.find(x => x.id === a.id)).filter(Boolean) as Activity[]
    const one = acts.length === 1
    const v: Record<string, string> = {
      ten: sample.name,
      hoatdong: acts.map(a => a.title).join(', '),
      thoigian: one ? when(acts[0].startAt) : acts.map(a => `${a.title}: ${when(a.startAt)}`).join('; '),
      diadiem: one ? acts[0].location || 'sẽ thông báo sau' : acts.map(a => `${a.title}: ${a.location || 'sẽ thông báo sau'}`).join('; '),
    }
    return text.replace(/\{(ten|hoatdong|thoigian|diadiem)\}/g, (_m, k) => v[k])
  }

  const send = async () => {
    if (!actIds.length) return setToast('Chọn ít nhất 1 hoạt động.')
    if (!picked.size) return setToast('Chọn ít nhất 1 sinh viên.')
    if (!subject.trim() || !body.trim()) return setToast('Nhập tiêu đề và nội dung.')
    if (!app && !email) return setToast('Chọn ít nhất một kênh gửi.')
    if (!confirm(`Gửi tới ${picked.size} sinh viên của ${actIds.length} hoạt động${email ? ' (có gửi email)' : ''}?`)) return
    setSending(true)
    setResult(null)
    try {
      const r = await sendMessage({ activityIds: actIds, studentIds: [...picked], subject: subject.trim(), body: body.trim(), app, email })
      setResult(r)
      setToast(`Đã gửi ${r.students} sinh viên${r.email ? `, ${r.email} email` : ''}${r.emailFailedCount ? `, ${r.emailFailedCount} email lỗi` : ''}.`)
    } catch (e: any) {
      setToast(e?.response?.data?.message?.toString() || 'Gửi thất bại.')
    } finally {
      setSending(false)
    }
  }

  const emailReady = !!status?.emailProvider

  return (
    <div className="page-container max-w-5xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Gửi nhắc nhở</h1>
        <p className="text-slate-500 text-sm mt-1">Chọn một hoặc nhiều hoạt động, chọn sinh viên, chọn nội dung rồi gửi qua thông báo trong hệ thống và/hoặc email.</p>
      </div>

      <section className="card p-5 mb-5">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h2 className="font-semibold text-slate-800">1. Chọn hoạt động <span className="text-slate-400 font-normal">({actIds.length} đã chọn)</span></h2>
          <input className="input w-full sm:w-64" placeholder="Tìm hoạt động..." value={actSearch} onChange={e => setActSearch(e.target.value)} aria-label="Tìm hoạt động" />
        </div>
        <div className="max-h-56 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-50">
          {visibleActs.map(a => (
            <label key={a.id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50">
              <input type="checkbox" checked={actIds.includes(a.id)} onChange={() => toggleAct(a.id)} />
              <span className="flex-1 min-w-0 truncate text-slate-800">{a.title}</span>
              <span className="text-xs text-slate-400 whitespace-nowrap">{when(a.startAt)}</span>
              <span className="text-xs text-slate-500 whitespace-nowrap">{a.status}</span>
            </label>
          ))}
          {visibleActs.length === 0 && <div className="px-3 py-6 text-center text-sm text-slate-400">Không có hoạt động.</div>}
        </div>
      </section>

      <section className="card p-5 mb-5">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h2 className="font-semibold text-slate-800">2. Chọn sinh viên <span className="text-slate-400 font-normal">({picked.size}/{audience.length} đã chọn)</span></h2>
          <div className="flex gap-2 flex-wrap">
            <select className="select" aria-label="Lọc theo trạng thái" value={partStatus} onChange={e => setPartStatus(e.target.value)}>
              <option value="">Mọi trạng thái</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input className="input w-full sm:w-56" placeholder="Tìm MSSV, tên, lớp..." value={stuSearch} onChange={e => setStuSearch(e.target.value)} aria-label="Tìm sinh viên" />
          </div>
        </div>
        {!actIds.length ? (
          <div className="py-8 text-center text-sm text-slate-400">Chọn hoạt động ở bước 1 để xem sinh viên.</div>
        ) : (
          <div className="max-h-72 overflow-y-auto border border-slate-100 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header sticky top-0">
                  <th className="px-3 py-2 w-10"><input type="checkbox" aria-label="Chọn tất cả" checked={allVisiblePicked} onChange={toggleAllVisible} /></th>
                  <th className="text-left px-3 py-2">MSSV</th>
                  <th className="text-left px-3 py-2">Họ tên</th>
                  <th className="text-left px-3 py-2">Lớp</th>
                  <th className="text-left px-3 py-2">Hoạt động / trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visibleStudents.map(s => (
                  <tr key={s.studentId} className="table-row">
                    <td className="px-3 py-2"><input type="checkbox" aria-label={`Chọn ${s.name}`} checked={picked.has(s.studentId)} onChange={() => toggleStu(s.studentId)} disabled={!s.active} /></td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">{s.mssv}</td>
                    <td className="px-3 py-2 text-slate-800">{s.name}{!s.email && <span className="ml-2 text-xs text-amber-600">chưa có email</span>}{!s.active && <span className="ml-2 text-xs text-red-500">đã khóa</span>}</td>
                    <td className="px-3 py-2 text-slate-600">{s.className ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 whitespace-normal">{s.activities.map(a => `${a.title} (${STATUS_LABEL[a.status]})`).join('; ')}</td>
                  </tr>
                ))}
                {visibleStudents.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-slate-400">Không có sinh viên phù hợp.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card p-5 mb-5 space-y-4">
        <h2 className="font-semibold text-slate-800">3. Nội dung và kênh gửi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="msg-template" className="block text-sm font-medium text-slate-700 mb-1.5">Mẫu nội dung</label>
            <select id="msg-template" className="select w-full" value={templateId} onChange={e => pickTemplate(e.target.value)}>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="msg-subject" className="block text-sm font-medium text-slate-700 mb-1.5">Tiêu đề</label>
            <input id="msg-subject" className="input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Tiêu đề thông báo / email" />
          </div>
        </div>
        <div>
          <label htmlFor="msg-body" className="block text-sm font-medium text-slate-700 mb-1.5">Nội dung</label>
          <textarea id="msg-body" rows={8} className="input" value={body} onChange={e => setBody(e.target.value)} placeholder="Nội dung gửi tới sinh viên..." />
          <p className="text-xs text-slate-400 mt-1">Biến tự điền theo từng sinh viên: {VARS.join(' ')}. Sinh viên có nhiều hoạt động thì liệt kê từng hoạt động.</p>
        </div>

        {sample && (subject || body) && (
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm">
            <div className="text-xs text-slate-400 mb-1">Xem trước (cho {sample.name})</div>
            <div className="font-semibold text-slate-800">{preview(subject)}</div>
            <div className="whitespace-pre-line text-slate-600 mt-1">{preview(body)}</div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <label className="flex items-center gap-2 text-slate-700"><input type="checkbox" checked={app} onChange={e => setApp(e.target.checked)} /> Thông báo trong hệ thống</label>
          <label className={`flex items-center gap-2 ${emailReady ? 'text-slate-700' : 'text-slate-400'}`}>
            <input type="checkbox" checked={email && emailReady} disabled={!emailReady} onChange={e => setEmail(e.target.checked)} /> Gửi email
          </label>
          <span className="text-xs text-slate-400">
            {emailReady ? `Email gửi bằng ${PROVIDER_LABEL[status!.emailProvider!]}${status?.emailFrom && status.emailProvider !== 'dry-run' ? ` (${status.emailFrom})` : ''}` : 'Chưa cấu hình email trên server (xem docs/EMAIL_VA_TU_DONG.md)'}
          </span>
        </div>

        <div className="flex justify-end">
          <button onClick={send} disabled={sending || !picked.size || !actIds.length} className="btn-primary">{sending ? 'Đang gửi...' : `Gửi cho ${picked.size} sinh viên`}</button>
        </div>
      </section>

      {result && (
        <section className="card p-5 mb-5 text-sm">
          <div className="font-semibold text-slate-800 mb-2">Kết quả gửi</div>
          <ul className="text-slate-600 space-y-1">
            <li>Thông báo trong hệ thống: <b>{result.app}</b> sinh viên</li>
            <li>Email đã gửi: <b>{result.email}</b>{result.emailFailedCount ? <span className="text-red-600"> · lỗi {result.emailFailedCount}</span> : null}</li>
            {result.ignored > 0 && <li className="text-amber-700">{result.ignored} sinh viên bị bỏ qua vì không thuộc hoạt động đã chọn hoặc đã bị khóa.</li>}
          </ul>
          {result.emailFailed.length > 0 && (
            <ul className="mt-2 text-xs text-red-600 space-y-0.5">{result.emailFailed.map(f => <li key={f.mssv}>{f.mssv}: {f.reason}</li>)}</ul>
          )}
        </section>
      )}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
