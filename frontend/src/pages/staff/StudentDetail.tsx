import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStudent, getStudentCriteriaProgress, type StudentDetail as StudentDetailType } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'

const tabs = ['Thông tin', 'Hoạt động', 'Khai báo', 'Cảnh báo', 'Thống kê', 'Tiêu chí']

const PARTICIPATION_LABEL: Record<string, string> = {
  REGISTERED: 'Đã đăng ký',
  ATTENDED: 'Đã tham gia',
  ABSENT: 'Vắng',
}

export default function StaffStudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [s, setS] = useState<StudentDetailType | null>(null)
  const [tab, setTab] = useState(0)

  const [progress, setProgress] = useState<Awaited<ReturnType<typeof getStudentCriteriaProgress>> | null>(null)

  useEffect(() => {
    if (!id) return
    getStudent(id).then(setS)
    getStudentCriteriaProgress(id).then(setProgress).catch(() => {})
  }, [id])

  if (!s) return <div className="page-container"><div className="card p-8 text-center text-slate-400 text-sm">Đang tải...</div></div>

  const count = (status: string) => s.participations.filter(p => p.status === status).length
  const attended = count('ATTENDED')
  const absent = count('ABSENT')
  const rate = attended + absent ? Math.round((attended / (attended + absent)) * 100) : null
  const byCategory = Object.entries(
    s.participations.reduce<Record<string, { total: number; attended: number }>>((acc, p) => {
      const c = (acc[p.category || 'Khác'] ??= { total: 0, attended: 0 })
      c.total++
      if (p.status === 'ATTENDED') c.attended++
      return acc
    }, {})
  ).sort((a, b) => b[1].total - a[1].total)
  const verified = s.declarations.filter(d => d.status === 'Đã xác minh' || d.status === 'VERIFIED').length

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>

      {/* Header */}
      <div className="card p-5 mb-5 flex items-start gap-4">
        <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {s.name.split(' ').map((w: string) => w[0]).slice(-2).join('')}
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold text-slate-800">{s.name}</div>
          <div className="text-slate-500 text-sm mt-0.5">{s.mssv} · Lớp {s.className ?? '—'} · Khóa {s.cohort ?? '—'}</div>
          <div className="flex gap-2 mt-2">
            <span className="badge bg-green-50 text-green-700 border border-green-200">{s.status}</span>
            <span className="badge bg-blue-50 text-blue-700 border border-blue-200">{s.major ?? '—'}</span>
            <span className={`badge ${s.participation === 'Cao' ? 'bg-green-50 text-green-700 border-green-200' : s.participation === 'Thấp' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'} border`}>
              Mức tham gia: {s.participation}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-800">{s.activities}</div>
          <div className="text-xs text-slate-500">hoạt động</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-5 overflow-x-auto">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${tab === i ? 'tab-active' : 'text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="card p-5 max-w-lg">
          <h2 className="font-semibold text-sm text-slate-700 mb-4">Thông tin cá nhân</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {[['MSSV', s.mssv], ['Họ tên', s.name], ['Lớp', s.className ?? '—'], ['Khóa', s.cohort ?? '—'], ['Ngành', s.major ?? '—'], ['Email', s.email]].map(([k, v]) => (
              <div key={k}><dt className="text-slate-500 text-xs">{k}</dt><dd className="text-slate-800 font-medium mt-0.5">{v}</dd></div>
            ))}
          </dl>
        </div>
      )}

      {tab === 1 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="table-header"><th className="text-left px-4 py-3">Hoạt động</th><th className="text-left px-4 py-3">Loại</th><th className="text-left px-4 py-3">Thời gian</th><th className="text-left px-4 py-3">Trạng thái</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {s.participations.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3 text-slate-700">{p.activityTitle}</td>
                  <td className="px-4 py-3 text-slate-500">{p.category}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(p.startAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3">{statusBadge(PARTICIPATION_LABEL[p.status] ?? p.status)}</td>
                </tr>
              ))}
              {s.participations.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400">Chưa tham gia hoạt động nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 2 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="table-header"><th className="text-left px-4 py-3">Mã</th><th className="text-left px-4 py-3">Hoạt động khai báo</th><th className="text-left px-4 py-3">Đơn vị</th><th className="text-left px-4 py-3">Ngày gửi</th><th className="text-left px-4 py-3">Trạng thái</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {s.declarations.map(d => (
                <tr key={d.code} className="table-row">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{d.code}</td>
                  <td className="px-4 py-3 text-slate-700">{d.activityName}</td>
                  <td className="px-4 py-3 text-slate-500">{d.unit}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(d.submittedAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3">{statusBadge(d.status)}</td>
                </tr>
              ))}
              {s.declarations.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Chưa có khai báo nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 3 && (
        <div className="space-y-3">
          {s.participation !== 'Cao' ? (
            <div className="card p-5 bg-red-50 border border-red-200">
              <div className="font-semibold text-red-800 mb-1">⚠️ Mức tham gia {s.participation === 'Thấp' ? 'thấp' : 'trung bình'}</div>
              <div className="text-red-700 text-sm">Sinh viên chỉ tham gia {s.activities} hoạt động. Nên tham gia thêm để đạt mức tham gia cao (≥ 6 hoạt động/học kỳ).</div>
            </div>
          ) : (
            <div className="card p-5 bg-green-50 border border-green-200">
              <div className="font-semibold text-green-800">✅ Không có cảnh báo</div>
              <div className="text-green-700 text-sm mt-1">Sinh viên đang tham gia tốt các hoạt động.</div>
            </div>
          )}
        </div>
      )}

      {tab === 4 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['Đã đăng ký', s.participations.length],
              ['Đã tham gia', attended],
              ['Vắng', absent],
              ['Tỉ lệ tham dự', rate === null ? '—' : `${rate}%`],
              ['Khai báo đã gửi', s.declarations.length],
              ['Khai báo đã xác minh', verified],
            ].map(([k, v]) => (
              <div key={k} className="card p-4">
                <div className="text-xs text-slate-500">{k}</div>
                <div className="text-2xl font-bold text-slate-800 mt-1">{v}</div>
              </div>
            ))}
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="table-header"><th className="text-left px-4 py-3">Loại hoạt động</th><th className="text-left px-4 py-3">Đăng ký</th><th className="text-left px-4 py-3">Đã tham gia</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {byCategory.map(([cat, v]) => (
                  <tr key={cat} className="table-row">
                    <td className="px-4 py-3 text-slate-700">{cat}</td>
                    <td className="px-4 py-3 text-slate-600">{v.total}</td>
                    <td className="px-4 py-3 text-slate-600">{v.attended}</td>
                  </tr>
                ))}
                {byCategory.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-10 text-slate-400">Chưa có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 5 && (
        <div className="space-y-4">
          {!progress ? (
            <div className="card p-8 text-center text-slate-400 text-sm">Đang tải...</div>
          ) : (
            <>
              <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500">Học kỳ {progress.semester ?? '—'} · Điểm ước tính</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">{progress.estimated}/{progress.maxTotal} <span className="text-sm font-medium text-slate-500">· Dự kiến {progress.rank}</span></div>
                </div>
                <p className="text-xs text-amber-700 sm:max-w-xs">⚠️ Điểm tham khảo, không phải điểm rèn luyện chính thức.</p>
              </div>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="table-header"><th className="text-left px-4 py-3">Nhóm</th><th className="text-left px-4 py-3">Tiêu chí</th><th className="text-left px-4 py-3">Tiến độ</th><th className="text-left px-4 py-3">Điểm</th><th className="text-left px-4 py-3">Trạng thái</th></tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {progress.items.map(c => (
                        <tr key={c.id} className="table-row">
                          <td className="px-4 py-3 text-slate-700 font-medium">{c.group}</td>
                          <td className="px-4 py-3 text-slate-600">{c.name}</td>
                          <td className="px-4 py-3 min-w-[160px]">
                            <div className="text-xs text-slate-500 mb-1">{c.current}/{c.required} lần</div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={c.pct} aria-valuemin={0} aria-valuemax={100}>
                              <div className={`h-full ${c.missing ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${c.pct}%` }} />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{c.earned ?? 0}/{c.points ?? 0}</td>
                          <td className="px-4 py-3">{c.missing ? <span className="text-amber-700 text-xs">Thiếu {c.missing} hoạt động</span> : <span className="text-green-700 text-xs">Đã đạt</span>}</td>
                        </tr>
                      ))}
                      {progress.items.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-10 text-slate-400">Học kỳ này chưa có tiêu chí</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
