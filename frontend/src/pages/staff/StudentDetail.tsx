import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStudent, type StudentDetail as StudentDetailType } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'

const tabs = ['Thông tin', 'Hoạt động', 'Khai báo', 'Cảnh báo']

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

  useEffect(() => { if (id) getStudent(id).then(setS) }, [id])

  if (!s) return <div className="page-container"><div className="card p-8 text-center text-slate-400 text-sm">Đang tải...</div></div>

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
    </div>
  )
}
