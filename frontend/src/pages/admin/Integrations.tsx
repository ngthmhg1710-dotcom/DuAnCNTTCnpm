import { useNavigate } from 'react-router-dom'
import { integrations } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { useState } from 'react'

export default function AdminIntegrations() {
  const navigate = useNavigate()
  const [syncModal, setSyncModal] = useState<number | null>(null)
  const [toast, setToast] = useState('')

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Tích hợp API</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý kết nối với các hệ thống bên ngoài</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map(intg => (
          <div key={intg.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 pr-2">
                <div className="font-bold text-slate-800 truncate">{intg.name}</div>
                <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">{intg.baseUrl}</div>
              </div>
              {statusBadge(intg.status)}
            </div>
            <dl className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div><dt className="text-slate-400">Xác thực</dt><dd className="text-slate-700 font-medium">{intg.auth}</dd></div>
              <div><dt className="text-slate-400">Đồng bộ cuối</dt><dd className="text-slate-700 font-medium">{intg.lastSync}</dd></div>
            </dl>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => navigate(`/admin/integrations/${intg.id}`)} className="btn-secondary text-xs py-1 px-3">Chi tiết</button>
              <button onClick={() => setSyncModal(intg.id)} className="btn-primary text-xs py-1 px-3">Sync Now</button>
              <button onClick={() => setToast('Kết nối thành công!')} className="btn-secondary text-xs py-1 px-3">Test</button>
            </div>
          </div>
        ))}
      </div>

      {syncModal !== null && (
        <Modal title="Xác nhận đồng bộ dữ liệu" onClose={() => setSyncModal(null)}>
          <p className="text-slate-600 text-sm mb-4">
            Bạn có chắc muốn đồng bộ <strong>{integrations.find(i => i.id === syncModal)?.name}</strong> ngay bây giờ?
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setSyncModal(null)} className="btn-secondary">Hủy</button>
            <button onClick={() => { setSyncModal(null); setToast('Đang đồng bộ...') }} className="btn-primary">Đồng bộ ngay</button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
