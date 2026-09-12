import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { students } from '../../data/mock'

const tabs = ['Thông tin', 'Hoạt động', 'Lịch sử', 'Tiêu chí', 'Thống kê', 'Cảnh báo']

export default function StaffStudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const s = students.find(x => x.id === Number(id)) ?? students[0]
  const [tab, setTab] = useState(0)

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>

      {/* Header */}
      <div className="card p-5 mb-5 flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {s.name.split(' ').map((w: string) => w[0]).slice(-2).join('')}
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold text-slate-800">{s.name}</div>
          <div className="text-slate-500 text-sm mt-0.5">{s.mssv} · Lớp {s.class} · Khóa {s.cohort}</div>
          <div className="flex gap-2 mt-2">
            <span className="badge bg-green-50 text-green-700 border border-green-200">{s.status}</span>
            <span className="badge bg-blue-50 text-blue-700 border border-blue-200">{s.major}</span>
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
          <h2 className="font-semibold text-sm text-slate-700 mb-4 uppercase tracking-wide">Thông tin cá nhân</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {[['MSSV', s.mssv], ['Họ tên', s.name], ['Lớp', s.class], ['Khóa', s.cohort], ['Ngành', s.major], ['Email', `${s.mssv}@student.tdtu.edu.vn`]].map(([k, v]) => (
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
              {[['Ngày hội tình nguyện mùa hè', 'Tình nguyện', '15/06/2024', 'Đã xác minh'],
                ['Cuộc thi lập trình ACM ICPC', 'Học thuật', '20/08/2024', 'Đã xác minh']].map(([n, t, d, st]) => (
                <tr key={n} className="table-row">
                  <td className="px-4 py-3 text-slate-700">{n}</td>
                  <td className="px-4 py-3 text-slate-500">{t}</td>
                  <td className="px-4 py-3 text-slate-500">{d}</td>
                  <td className="px-4 py-3"><span className="badge bg-green-50 text-green-700 border border-green-200">{st}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 2 && (
        <div className="card divide-y divide-slate-50">
          {[['12/09/2024', 'Khai báo được xác minh', 'success'], ['10/09/2024', 'Gửi khai báo hoạt động', 'info'], ['15/06/2024', 'Tham gia Ngày hội tình nguyện', 'success']].map(([d, e, t]) => (
            <div key={e} className="px-5 py-4 flex gap-4 items-center">
              <span className="text-xs text-slate-400 w-24 font-mono">{d}</span>
              <div className={`w-2 h-2 rounded-full ${t === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
              <span className="text-sm text-slate-700">{e}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 3 && (
        <div className="grid grid-cols-2 gap-4">
          {[['Tình nguyện & Cộng đồng', 2, 2, 100], ['Học thuật & Chuyên môn', 2, 3, 67], ['Văn hóa & Thể thao', 1, 1, 100], ['Kỹ năng & Ngoại khóa', 0, 1, 0]].map(([n, c, r, p]) => (
            <div key={n as string} className="card p-4">
              <div className="font-medium text-sm text-slate-700 mb-2">{n}</div>
              <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Tiến độ</span><span className="font-semibold">{c}/{r}</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${p}%`, background: (p as number) === 100 ? '#22c55e' : (p as number) > 0 ? '#f59e0b' : '#ef4444' }} /></div>
            </div>
          ))}
        </div>
      )}

      {tab === 4 && (
        <div className="card p-6 text-slate-500 text-sm text-center">Biểu đồ thống kê hoạt động cá nhân sẽ được hiển thị ở đây.</div>
      )}

      {tab === 5 && (
        <div className="space-y-3">
          {s.participation === 'Thấp' ? (
            <div className="card p-5 bg-red-50 border border-red-200">
              <div className="font-semibold text-red-800 mb-1">⚠️ Mức tham gia thấp</div>
              <div className="text-red-700 text-sm">Sinh viên chỉ tham gia {s.activities} hoạt động. Cần ít nhất 4 hoạt động/học kỳ.</div>
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
