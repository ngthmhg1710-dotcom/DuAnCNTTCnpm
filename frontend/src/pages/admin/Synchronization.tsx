import { useEffect, useState } from 'react'
import { getSyncHistory, type SyncLog } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'

export default function AdminSynchronization() {
  const [history, setHistory] = useState<SyncLog[]>([])
  useEffect(() => { getSyncHistory().then(setHistory).catch(() => {}) }, [])
  const sum = (k: 'records' | 'failed') => history.reduce((n, s) => n + s[k], 0)
  const stats: [string, number, string][] = [
    ['Tổng sync', history.length, 'bg-slate-50'],
    ['Thành công', history.filter(s => s.status === 'Thành công').length, 'bg-green-50'],
    ['Thất bại', history.filter(s => s.status === 'Thất bại').length, 'bg-red-50'],
    ['Records', sum('records'), 'bg-purple-50'],
    ['Records lỗi', sum('failed'), 'bg-amber-50'],
  ]

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Đồng bộ dữ liệu</h1>
        <p className="text-slate-500 text-sm mt-1">Lịch sử 200 lần đồng bộ gần nhất</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {stats.map(([l, v, c]) => (
          <div key={l} className={`stat-card ${c}`}>
            <div className="text-lg sm:text-xl font-bold text-slate-800">{v.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">{l}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">Tích hợp</th>
                <th className="text-left px-4 py-3">Thời gian</th>
                <th className="text-left px-4 py-3">Records</th>
                <th className="text-left px-4 py-3">Thành công</th>
                <th className="text-left px-4 py-3">Lỗi</th>
                <th className="text-left px-4 py-3">Thời lượng</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map(s => (
                <tr key={s.id} className="table-row" title={s.error ?? undefined}>
                  <td className="px-4 py-3 font-medium text-slate-800">{s.integration}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{new Date(s.startedAt).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-3 text-slate-600">{s.records.toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{s.success.toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-500 font-medium">{s.failed}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{(s.durationMs / 1000).toFixed(1)}s</td>
                  <td className="px-4 py-3">{statusBadge(s.status)}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-slate-500">Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
