import { useEffect, useState } from 'react'
import { getAccounts, getAnalyticsOverview } from '../../lib/api'

const ROLES = [
  { name: 'Sinh viên', bar: 'bg-sky-400', dot: 'bg-sky-400' },
  { name: 'Cán bộ', bar: 'bg-emerald-400', dot: 'bg-emerald-400' },
  { name: 'Admin', bar: 'bg-violet-400', dot: 'bg-violet-400' },
]

const DECL_LABEL: Record<string, string> = {
  SUBMITTED: 'Đã nộp',
  PROCESSING: 'Đang xử lý',
  VERIFIED: 'Đã xác minh',
  NEEDS_MORE_INFO: 'Cần bổ sung',
  REJECTED: 'Từ chối',
}

function Bars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map(r => r.value))
  if (!rows.length) return <div className="text-slate-500 text-xs py-4">Chưa có dữ liệu</div>
  return (
    <div className="space-y-3">
      {rows.map(r => (
        <div key={r.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600">{r.label}</span>
            <span className="font-semibold text-slate-800">{r.value}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-slate-800" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [overview, setOverview] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([getAccounts(), getAnalyticsOverview()]).then(([a, o]) => {
      if (a.status === 'fulfilled') setAccounts(a.value)
      if (o.status === 'fulfilled') setOverview(o.value)
      setLoading(false)
    })
  }, [])

  const total = accounts.length
  const locked = accounts.filter(a => a.status === 'Khóa').length
  const byRole = ROLES.map(r => ({ ...r, count: accounts.filter(a => a.role === r.name).length }))
  const s = overview?.summary
  const num = (v?: number) => (loading ? '…' : (v ?? 0).toLocaleString('vi-VN'))

  const tiles = [
    { label: 'Hoạt động', value: s?.activities },
    { label: 'Lượt tham gia', value: s?.participations },
    { label: 'Khai báo', value: s?.declarations },
    { label: 'Tài khoản bị khóa', value: loading ? undefined : locked },
  ]

  return (
    <div className="page-container">
      <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-white to-violet-50 border border-slate-200 text-slate-900 p-6 sm:p-8 mb-4">
        <div className="text-slate-500 text-sm">Admin Dashboard · Hệ thống quản lý hoạt động sinh viên TDTU</div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-10 mt-4">
          <div>
            <div className="text-5xl sm:text-6xl font-bold tracking-tight">{num(total)}</div>
            <div className="text-slate-500 text-sm mt-1">tổng tài khoản</div>
          </div>
          <div className="flex-1">
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-200">
              {byRole.map(r => (
                <div key={r.name} className={r.bar} style={{ width: `${total ? (r.count / total) * 100 : 0}%` }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm">
              {byRole.map(r => (
                <div key={r.name} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${r.dot}`} />
                  <span className="text-slate-600">{r.name}</span>
                  <span className="font-semibold">{loading ? '…' : r.count}</span>
                  {!loading && total > 0 && <span className="text-slate-500">({Math.round((r.count / total) * 100)}%)</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {tiles.map(t => (
          <div key={t.label} className="card p-5">
            <div className="text-3xl font-bold text-slate-900">{num(t.value)}</div>
            <div className="text-xs text-slate-500 mt-1">{t.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="font-semibold text-slate-800 text-sm mb-4">Hoạt động theo nhóm</div>
          <Bars rows={(overview?.byCategory ?? []).map((x: any) => ({ label: x.category, value: x.value }))} />
        </div>
        <div className="card p-5">
          <div className="font-semibold text-slate-800 text-sm mb-4">Khai báo theo trạng thái</div>
          <Bars rows={(overview?.byDeclarationStatus ?? []).map((x: any) => ({ label: DECL_LABEL[x.status] ?? x.status, value: x.value }))} />
        </div>
        <div className="card p-5">
          <div className="font-semibold text-slate-800 text-sm mb-4">Tài khoản mới nhất</div>
          {accounts.length === 0 ? (
            <div className="text-slate-500 text-xs py-4">Chưa có dữ liệu</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {accounts.slice(-5).reverse().map(a => (
                <li key={a.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="text-slate-800 truncate">{a.name}</div>
                    <div className="text-xs text-slate-500 truncate">{a.email}</div>
                  </div>
                  <span className="text-xs text-slate-600 shrink-0">{a.role}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
