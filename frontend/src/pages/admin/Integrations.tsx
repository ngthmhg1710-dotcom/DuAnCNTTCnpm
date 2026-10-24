import { useEffect, useState } from 'react'
import { deleteIntegration, getIntegrations, saveIntegration, syncIntegration, testIntegration, type Integration } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

const empty = { name: '', baseUrl: '', authType: 'API_KEY', apiKey: '', isActive: true }

export default function AdminIntegrations() {
  const [items, setItems] = useState<Integration[]>([])
  const [edit, setEdit] = useState<({ id: number | null } & typeof empty) | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')

  const load = () => getIntegrations().then(setItems).catch(() => setToast('Không tải được danh sách tích hợp'))
  useEffect(() => { load() }, [])

  const run = async (fn: () => Promise<string>) => {
    setBusy(true)
    try { setToast(await fn()) } catch (e: any) { setToast(e.response?.data?.message || 'Có lỗi xảy ra') }
    setBusy(false)
    load()
  }

  const save = () => run(async () => {
    const { id, ...body } = edit!
    await saveIntegration(id, body)
    setEdit(null)
    return 'Đã lưu kết nối'
  })

  return (
    <div className="page-container">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tích hợp API</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý kết nối với các hệ thống bên ngoài</p>
        </div>
        <button onClick={() => setEdit({ id: null, ...empty })} className="btn-primary">Thêm kết nối</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(intg => (
          <div key={intg.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 pr-2">
                <div className="font-bold text-slate-800 truncate">{intg.name}</div>
                <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">{intg.baseUrl}</div>
              </div>
              {statusBadge(intg.isActive ? 'Hoạt động' : 'Tắt')}
            </div>
            <dl className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div><dt className="text-slate-400">Xác thực</dt><dd className="text-slate-700 font-medium">{intg.authType}</dd></div>
              <div><dt className="text-slate-400">Đồng bộ cuối</dt><dd className="text-slate-700 font-medium">{intg.lastSyncAt ? new Date(intg.lastSyncAt).toLocaleString('vi-VN') : 'Chưa đồng bộ'}</dd></div>
            </dl>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setEdit({ id: intg.id, name: intg.name, baseUrl: intg.baseUrl, authType: intg.authType, apiKey: '', isActive: intg.isActive })} className="btn-secondary text-xs py-1 px-3">Sửa</button>
              <button disabled={busy} onClick={() => run(async () => { const r = await syncIntegration(intg.id); return `${r.status}: ${r.success}/${r.records} bản ghi` })} className="btn-primary text-xs py-1 px-3">Sync Now</button>
              <button disabled={busy} onClick={() => run(async () => (await testIntegration(intg.id)).message)} className="btn-secondary text-xs py-1 px-3">Test</button>
              <button disabled={busy} onClick={() => confirm(`Xóa kết nối "${intg.name}"?`) && run(async () => { await deleteIntegration(intg.id); return 'Đã xóa' })} className="btn-secondary text-xs py-1 px-3 text-red-600">Xóa</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-slate-500 text-sm">Chưa có kết nối nào.</div>}
      </div>

      {edit && (
        <Modal title={edit.id ? 'Sửa kết nối' : 'Thêm kết nối'} onClose={() => setEdit(null)}>
          <div className="space-y-3">
            <input className="input" placeholder="Tên" value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} />
            <input className="input font-mono text-sm" placeholder="Base URL (https://...)" value={edit.baseUrl} onChange={e => setEdit({ ...edit, baseUrl: e.target.value })} />
            <input className="input" type="password" placeholder={edit.id ? 'API Key (để trống nếu giữ nguyên)' : 'API Key'} value={edit.apiKey} onChange={e => setEdit({ ...edit, apiKey: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={edit.isActive} onChange={e => setEdit({ ...edit, isActive: e.target.checked })} /> Đang hoạt động
            </label>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEdit(null)} className="btn-secondary">Hủy</button>
              <button disabled={busy} onClick={save} className="btn-primary">Lưu</button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
