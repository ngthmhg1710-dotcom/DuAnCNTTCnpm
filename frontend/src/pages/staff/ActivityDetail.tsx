import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { activities } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'

const tabs = ['Tổng quan', 'Người đăng ký', 'Người tham gia', 'Tiêu chí', 'Lịch sử thay đổi']

export default function StaffActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const a = activities.find(x => x.id === Number(id)) ?? activities[0]
  const [tab, setTab] = useState(0)

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>

      <div className="card p-5 mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{a.name}</h1>
          <div className="flex gap-2 mt-2">{statusBadge(a.status)}<span className="badge bg-slate-100 text-slate-500 border border-slate-200">{a.type}</span></div>
        </div>
        <button onClick={() => navigate(`/staff/activities/${id}/edit`)} className="btn-secondary">Chỉnh sửa</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[['Số đăng ký', a.registered, 'bg-blue-50 text-blue-600'], ['Số tham gia', Math.floor(a.registered * 0.88), 'bg-green-50 text-green-600'], ['Vắng', Math.floor(a.registered * 0.12), 'bg-red-50 text-red-600'], ['Tỷ lệ tham gia', '88%', 'bg-purple-50 text-purple-600']].map(([l, v, c]) => (
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
            {[['Đơn vị tổ chức', a.unit], ['Thời gian', `${a.startDate} · ${a.time}`], ['Địa điểm', a.location], ['Số lượng', `${a.registered}/${a.capacity}`], ['Học kỳ', a.semester]].map(([k, v]) => (
              <div key={k}><dt className="text-slate-500 text-xs">{k}</dt><dd className="text-slate-800 font-medium mt-0.5">{v}</dd></div>
            ))}
            <div className="col-span-2"><dt className="text-slate-500 text-xs mb-1">Mô tả</dt><dd className="text-slate-600 text-sm">{a.description}</dd></div>
          </dl>
        </div>
      )}

      {(tab === 1 || tab === 2) && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="table-header"><th className="text-left px-4 py-3">MSSV</th><th className="text-left px-4 py-3">Họ tên</th><th className="text-left px-4 py-3">Lớp</th><th className="text-left px-4 py-3">Ngày đăng ký</th><th className="text-left px-4 py-3">Trạng thái</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {[['521H0001', 'Nguyễn Minh Tuấn', 'TH21A', '01/06/2024', 'Đã tham gia'],
                ['521H0002', 'Trần Thị Bích Ngọc', 'TH21A', '02/06/2024', tab === 1 ? 'Đã đăng ký' : 'Đã tham gia'],
                ['521H0004', 'Phạm Thị Lan Anh', 'TH21B', '03/06/2024', 'Đã tham gia']].map(([ms, n, c, d, st]) => (
                <tr key={ms} className="table-row">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{ms}</td>
                  <td className="px-4 py-3 text-slate-700">{n}</td>
                  <td className="px-4 py-3 text-slate-500">{c}</td>
                  <td className="px-4 py-3 text-slate-500">{d}</td>
                  <td className="px-4 py-3">{statusBadge(st)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 3 && (
        <div className="card p-5">
          <div className="bg-blue-50 rounded-lg p-4 text-sm">
            <div className="font-semibold text-blue-800">Học thuật & Chuyên môn</div>
            <div className="text-blue-600 mt-1">Tiêu chí: Seminar / Hội thảo chuyên ngành</div>
            <div className="text-blue-700 text-xs mt-1 font-medium">Đóng góp: +1 lần tham gia</div>
          </div>
        </div>
      )}

      {tab === 4 && (
        <div className="card divide-y divide-slate-50">
          {[['18/08/2026 09:00', 'Nguyễn Thị Thu', 'Cập nhật số lượng: 95 → 100'],
            ['15/08/2026 14:30', 'Nguyễn Thị Thu', 'Tạo hoạt động và công bố']].map(([t, u, n]) => (
            <div key={t as string} className="px-5 py-4 text-sm flex gap-4">
              <span className="text-slate-400 text-xs w-36 font-mono">{t}</span>
              <span className="text-blue-600 font-medium w-32">{u}</span>
              <span className="text-slate-600">{n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
