import { useParams, useNavigate } from 'react-router-dom'
import { integrations } from '../../data/mock'
import { Toast } from '../../components/ui/Toast'
import { useState } from 'react'

export default function AdminIntegrationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const intg = integrations.find(x => x.id === Number(id)) ?? integrations[0]
  const [toast, setToast] = useState('')
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Cấu hình: {intg.name}</h1>

      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên tích hợp</label>
            <input className="input" defaultValue={intg.name} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Base URL</label>
            <input className="input font-mono text-sm" defaultValue={intg.baseUrl} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Loại xác thực</label>
            <select className="select w-full" defaultValue={intg.auth}>
              <option>API Key</option><option>OAuth 2.0</option><option>Bearer Token</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">API Key / Secret</label>
            <div className="flex gap-2">
              <input type={showKey ? 'text' : 'password'} className="input flex-1 font-mono text-sm" defaultValue="sk-tdtu-2024-xxxxxxxxxxxx" />
              <button onClick={() => setShowKey(p => !p)} className="btn-secondary text-xs px-3">{showKey ? '🙈 Ẩn' : '👁 Hiện'}</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Timeout (giây)</label>
            <input type="number" className="input" defaultValue={30} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Số lần retry</label>
            <input type="number" className="input" defaultValue={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tần suất đồng bộ</label>
            <select className="select w-full">
              <option>Mỗi giờ</option><option>Mỗi 6 giờ</option><option>Mỗi ngày</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Kích hoạt</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
          <button onClick={() => setToast('Kết nối thành công!')} className="btn-secondary">Test Connection</button>
          <button onClick={() => setToast('Đang đồng bộ...')} className="btn-secondary">Sync Now</button>
          <button onClick={() => setToast('Đã lưu cấu hình!')} className="btn-primary">Lưu</button>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
