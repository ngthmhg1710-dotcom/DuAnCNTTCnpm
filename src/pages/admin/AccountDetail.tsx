import { useParams, useNavigate } from 'react-router-dom'
import { accounts } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'

export default function AdminAccountDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const a = accounts.find(x => x.id === Number(id)) ?? accounts[0]

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>

      <div className="card p-5 mb-5 flex gap-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {a.name.split(' ').map((w: string) => w[0]).slice(-2).join('')}
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">{a.name}</div>
          <div className="text-slate-500 text-sm">{a.username} · {a.email}</div>
          <div className="flex gap-2 mt-2">{statusBadge(a.status)}<span className="badge bg-purple-50 text-purple-700 border border-purple-200">{a.role}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="font-semibold text-sm text-slate-700 mb-4 uppercase tracking-wide">Thông tin tài khoản</h2>
          <dl className="space-y-3 text-sm">
            {[['Username', a.username], ['Họ tên', a.name], ['Email', a.email], ['Vai trò', a.role], ['Trạng thái', a.status], ['Ngày tạo', a.created], ['Đăng nhập cuối', a.lastLogin]].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-slate-800 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-sm text-slate-700 mb-4 uppercase tracking-wide">Lịch sử đăng nhập</h2>
          <div className="space-y-2 text-sm">
            {[['18/08/2026 09:32', '192.168.1.101', 'Chrome'], ['17/08/2026 14:15', '192.168.1.101', 'Chrome'], ['16/08/2026 09:00', '10.0.0.55', 'Safari']].map(([t, ip, br]) => (
              <div key={t as string} className="bg-slate-50 rounded-lg px-3 py-2 text-xs">
                <div className="text-slate-700 font-medium">{t}</div>
                <div className="text-slate-500">{ip} · {br}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
