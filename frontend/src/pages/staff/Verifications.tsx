import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifications } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'

const statusTabs = ['Tất cả', 'Chờ xử lý', 'Cần bổ sung', 'Đã xác minh', 'Từ chối']

export default function StaffVerifications() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)

  const filtered = tab === 0 ? verifications : verifications.filter(v => v.status === statusTabs[tab])

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Xác minh khai báo</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý và xử lý các yêu cầu xác minh từ sinh viên</p>
      </div>

      <div className="flex border-b border-slate-200 mb-5">
        {statusTabs.map((t, i) => {
          const count = i === 0 ? verifications.length : verifications.filter(v => v.status === t).length
          return (
            <button key={t} onClick={() => setTab(i)}
              className={`px-5 py-2.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${tab === i ? 'tab-active' : 'text-slate-500 hover:text-slate-700'}`}>
              {t}
              {count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === i ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{count}</span>}
            </button>
          )
        })}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">Mã yêu cầu</th>
              <th className="text-left px-4 py-3">Sinh viên</th>
              <th className="text-left px-4 py-3">Hoạt động</th>
              <th className="text-left px-4 py-3">Đơn vị</th>
              <th className="text-left px-4 py-3">Ngày gửi</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-left px-4 py-3">Người xử lý</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(v => (
              <tr key={v.id} className="table-row">
                <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{v.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{v.student}</div>
                  <div className="text-slate-500 text-xs">{v.mssv}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{v.activity}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{v.unit}</td>
                <td className="px-4 py-3 text-slate-600">{v.submittedDate}</td>
                <td className="px-4 py-3">{statusBadge(v.status)}</td>
                <td className="px-4 py-3 text-slate-600">{v.handler}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/staff/verifications/${v.id}`)} className="btn-secondary text-xs py-1">Xem</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-slate-400">Không có khai báo nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
