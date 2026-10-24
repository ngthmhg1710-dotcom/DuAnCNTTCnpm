import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getActivity, importAttendanceFile, type ActivityDetail as ActivityDetailType } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'

const tabs = ['Tổng quan', 'Người đăng ký / tham gia']

const PARTICIPATION_LABEL: Record<string, string> = {
  REGISTERED: 'Đã đăng ký',
  ATTENDED: 'Đã tham gia',
  ABSENT: 'Vắng',
}

export default function StaffActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [a, setA] = useState<ActivityDetailType | null>(null)
  const [tab, setTab] = useState(0)
  const [result, setResult] = useState<Awaited<ReturnType<typeof importAttendanceFile>> | null>(null)

  useEffect(() => { if (id) getActivity(id).then(setA) }, [id])

  const onFile = async (file?: File) => {
    if (!file || !id) return
    setResult(await importAttendanceFile(Number(id), file))
    setA(await getActivity(id))
  }

  if (!a) return <div className="page-container"><div className="card p-8 text-center text-slate-400 text-sm">Đang tải...</div></div>

  const attended = a.participants.filter(p => p.status === 'ATTENDED').length
  const absent = a.participants.filter(p => p.status === 'ABSENT').length
  const rate = a.registered > 0 ? Math.round((attended / a.registered) * 100) : 0

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>

      <div className="card p-5 mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{a.title}</h1>
          <div className="flex gap-2 mt-2">{statusBadge(a.status)}<span className="badge bg-slate-100 text-slate-500 border border-slate-200">{a.category}</span></div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <a href="/mau-diem-danh.csv" download className="btn-secondary">Tải file mẫu</a>
          <label className="btn-primary cursor-pointer">
            Import điểm danh (CSV)
            <input type="file" accept=".csv" hidden onChange={e => { onFile(e.target.files?.[0]); e.target.value = '' }} />
          </label>
          <button onClick={() => navigate(`/staff/activities/${id}/edit`)} className="btn-secondary">Chỉnh sửa</button>
        </div>
      </div>

      {result && (
        <div className="card p-4 mb-5 text-sm">
          <div className="font-medium text-slate-800">Đã xác nhận tham gia: {result.updated} sinh viên đã đăng ký, {result.created} sinh viên đến thẳng; {result.errors.length} lỗi.</div>
          {result.errors.slice(0, 10).map(e => <div key={e} className="text-red-600">{e}</div>)}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[['Số đăng ký', a.registered, 'bg-blue-50 text-blue-600'], ['Số tham gia', attended, 'bg-green-50 text-green-600'], ['Vắng', absent, 'bg-red-50 text-red-600'], ['Tỷ lệ tham gia', `${rate}%`, 'bg-purple-50 text-purple-600']].map(([l, v, c]) => (
          <div key={l as string} className="stat-card">
            <div className={`text-2xl font-bold mb-1 ${(c as string).split(' ')[1]}`}>{v}</div>
            <div className="text-xs text-slate-500">{l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-5">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${tab === i ? 'tab-active' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <div className="card p-5 max-w-2xl">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {[['Đơn vị tổ chức', a.unit ?? '—'], ['Thời gian bắt đầu', new Date(a.startAt).toLocaleString('vi-VN')], ['Thời gian kết thúc', a.endAt ? new Date(a.endAt).toLocaleString('vi-VN') : '—'], ['Địa điểm', a.location ?? '—'], ['Số lượng', `${a.registered}/${a.capacity ?? '—'}`]].map(([k, v]) => (
              <div key={k}><dt className="text-slate-500 text-xs">{k}</dt><dd className="text-slate-800 font-medium mt-0.5">{v}</dd></div>
            ))}
            <div className="col-span-2"><dt className="text-slate-500 text-xs mb-1">Mô tả</dt><dd className="text-slate-600 text-sm">{a.description ?? '—'}</dd></div>
          </dl>
        </div>
      )}

      {tab === 1 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
<table className="w-full text-sm">
            <thead><tr className="table-header"><th className="text-left px-4 py-3">MSSV</th><th className="text-left px-4 py-3">Họ tên</th><th className="text-left px-4 py-3">Lớp</th><th className="text-left px-4 py-3">Ngày đăng ký</th><th className="text-left px-4 py-3">Trạng thái</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {a.participants.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.mssv}</td>
                  <td className="px-4 py-3 text-slate-700">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.className ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{p.joinedAt ? new Date(p.joinedAt).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="px-4 py-3">{statusBadge(PARTICIPATION_LABEL[p.status] ?? p.status)}</td>
                </tr>
              ))}
              {a.participants.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Chưa có sinh viên đăng ký</td></tr>
              )}
            </tbody>
          </table>
</div>
        </div>
      )}
    </div>
  )
}
