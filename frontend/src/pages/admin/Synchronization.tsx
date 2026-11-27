import { useEffect, useState } from 'react'
import { DATA_TYPE_LABEL, getSyncErrors, getSyncHistory, retrySyncError, retrySyncLog, type SyncError, type SyncLog } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

export default function AdminSynchronization() {
  const [history, setHistory] = useState<SyncLog[]>([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<SyncLog | null>(null)
  const [errors, setErrors] = useState<SyncError[]>([])
  const [busy, setBusy] = useState<number | 'all' | null>(null)
  const [toast, setToast] = useState('')

  const load = () => getSyncHistory().then(setHistory).catch(() => setToast('Không tải được lịch sử đồng bộ.')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const open = async (log: SyncLog) => {
    setDetail(log)
    setErrors([])
    getSyncErrors(log.id).then(setErrors).catch(() => setToast('Không tải được chi tiết lỗi.'))
  }

  // Sau khi thử lại: tải lại chi tiết và lịch sử để số liệu, trạng thái cập nhật theo.
  const refresh = async (logId: number) => {
    const [errs, hist] = await Promise.all([getSyncErrors(logId), getSyncHistory()])
    setErrors(errs)
    setHistory(hist)
    setDetail(hist.find(h => h.id === logId) ?? null)
  }

  const retryOne = async (e: SyncError) => {
    if (!detail) return
    setBusy(e.id)
    try {
      const r = await retrySyncError(e.id)
      setToast(r.message)
      await refresh(detail.id)
    } catch (err: any) {
      setToast(err?.response?.data?.message?.toString() || 'Thử lại thất bại.')
    } finally {
      setBusy(null)
    }
  }

  const retryAll = async () => {
    if (!detail) return
    setBusy('all')
    try {
      const r = await retrySyncLog(detail.id)
      setToast(`Đã xử lý ${r.resolved}/${r.total} bản ghi, còn lỗi ${r.stillFailing}.`)
      await refresh(detail.id)
    } catch (err: any) {
      setToast(err?.response?.data?.message?.toString() || 'Thử lại thất bại.')
    } finally {
      setBusy(null)
    }
  }

  const sum = (k: 'records' | 'failed') => history.reduce((n, s) => n + s[k], 0)
  const stats: [string, number, string][] = [
    ['Tổng sync', history.length, 'bg-slate-50'],
    ['Thành công', history.filter(s => s.status === 'Thành công').length, 'bg-green-50'],
    ['Có lỗi / thất bại', history.filter(s => s.status !== 'Thành công').length, 'bg-red-50'],
    ['Records', sum('records'), 'bg-purple-50'],
    ['Records lỗi còn lại', history.reduce((n, s) => n + (s.openErrors ?? 0), 0), 'bg-amber-50'],
  ]
  const open_ = errors.filter(e => !e.resolved)

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Đồng bộ dữ liệu</h1>
        <p className="text-slate-500 text-sm mt-1">Lịch sử 200 lần đồng bộ gần nhất. Bấm vào một dòng để xem lỗi từng bản ghi và thử lại.</p>
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
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">Tích hợp</th>
                <th className="text-left px-4 py-3">Dữ liệu</th>
                <th className="text-left px-4 py-3">Nguồn</th>
                <th className="text-left px-4 py-3">Thời gian</th>
                <th className="text-left px-4 py-3">Records</th>
                <th className="text-left px-4 py-3">Thành công</th>
                <th className="text-left px-4 py-3">Lỗi</th>
                <th className="text-left px-4 py-3">Thời lượng</th>
                <th className="text-left px-4 py-3">Kết quả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && <tr><td colSpan={9} className="text-center py-10 text-slate-400">Đang tải...</td></tr>}
              {history.map(s => (
                <tr key={s.id} className="table-row cursor-pointer hover:bg-slate-50" onClick={() => open(s)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && open(s)}>
                  <td className="px-4 py-3 font-medium text-slate-800">{s.integration}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{DATA_TYPE_LABEL[s.dataType ?? ''] ?? '—'}</td>
                  <td className="px-4 py-3 text-xs"><span className={`badge border ${s.source === 'Đẩy' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{s.source === 'Đẩy' ? 'Đối tác đẩy' : 'Hệ thống kéo'}</span></td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{new Date(s.startedAt).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-3 text-slate-600">{s.records.toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{s.success.toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-500 font-medium">{s.failed}{s.openErrors ? <span className="text-xs text-slate-400 font-normal"> ({s.openErrors} chưa xử lý)</span> : null}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{(s.durationMs / 1000).toFixed(1)}s</td>
                  <td className="px-4 py-3 whitespace-normal">
                    {statusBadge(s.status)}
                    {s.error && <div className="text-xs text-red-600 mt-1 max-w-xs">{s.error}</div>}
                  </td>
                </tr>
              ))}
              {!loading && history.length === 0 && (
                <tr><td colSpan={9} className="text-center py-10 text-slate-500">Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <Modal title={`Lần đồng bộ #${detail.id}: ${detail.integration}`} onClose={() => setDetail(null)} width="max-w-3xl">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              {statusBadge(detail.status)}
              <span>{new Date(detail.startedAt).toLocaleString('vi-VN')}</span>
              <span>{detail.records} bản ghi · <b className="text-green-600">{detail.success} thành công</b> · <b className="text-red-500">{detail.failed} lỗi</b></span>
            </div>
            {detail.error && <div className="rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2">Lỗi cả lần đồng bộ: {detail.error}. Kiểm tra API key và địa chỉ của kết nối, rồi bấm "Sync Now" ở mục Tích hợp API.</div>}

            {errors.length > 0 ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-700">Bản ghi lỗi ({open_.length} chưa xử lý)</div>
                  <button onClick={retryAll} disabled={busy !== null || open_.length === 0} className="btn-primary text-xs py-1 px-3">
                    {busy === 'all' ? 'Đang thử lại...' : 'Thử lại tất cả'}
                  </button>
                </div>
                <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100 max-h-[50vh] overflow-y-auto">
                  {errors.map(e => (
                    <div key={e.id} className="p-3 text-sm space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-xs text-slate-400">Dòng {e.rowIndex}</span>
                          {e.key && <span className="ml-2 font-mono text-xs text-slate-700">{e.key}</span>}
                          {e.resolved
                            ? <span className="ml-2 badge bg-green-50 text-green-700 border border-green-200 text-xs">Đã xử lý</span>
                            : <div className="text-red-600 mt-0.5">{e.reason}</div>}
                          {e.attempts > 0 && !e.resolved && <div className="text-xs text-slate-400">Đã thử lại {e.attempts} lần</div>}
                        </div>
                        {!e.resolved && (
                          <button onClick={() => retryOne(e)} disabled={busy !== null} className="btn-secondary text-xs py-1 px-2 shrink-0">
                            {busy === e.id ? '...' : 'Thử lại'}
                          </button>
                        )}
                      </div>
                      <details className="text-xs text-slate-500">
                        <summary className="cursor-pointer">Dữ liệu gốc</summary>
                        <pre className="mt-1 bg-slate-50 rounded p-2 overflow-x-auto">{JSON.stringify(e.raw, null, 2)}</pre>
                      </details>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">Lỗi "không tìm thấy" thường do dữ liệu chưa có trong hệ thống: bổ sung xong rồi bấm Thử lại.</p>
              </>
            ) : (
              !detail.error && <div className="text-sm text-slate-500 text-center py-6">{detail.failed ? 'Đang tải chi tiết lỗi...' : 'Không có bản ghi lỗi.'}</div>
            )}
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
