import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDeclaration, reviewDeclaration, type DeclarationRow } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import Evidence from '../../components/ui/Evidence'

export default function StaffVerificationDetail() {
  const { id: code } = useParams()
  const navigate = useNavigate()
  const [v, setV] = useState<DeclarationRow | null>(null)
  const [modal, setModal] = useState<'reject' | 'supplement' | 'approve' | null>(null)
  const [reason, setReason] = useState('')
  const [toast, setToast] = useState('')

  const load = () => { if (code) getDeclaration(code).then(setV) }
  useEffect(load, [code])

  if (!v) return <div className="page-container"><div className="card p-8 text-center text-slate-400 text-sm">Đang tải...</div></div>

  const handleAction = async (action: 'receive' | 'approve' | 'reject' | 'supplement', message: string) => {
    await reviewDeclaration(code!, action, reason || undefined)
    setModal(null)
    setToast(message)
    setReason('')
    load()
  }

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>

      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-xs text-slate-500 font-mono mb-1">{v.code}</div>
          <h1 className="text-xl font-bold text-slate-800">Xác minh: {v.activity}</h1>
          <div className="mt-2">{statusBadge(v.status)}</div>
        </div>
        {v.status === 'Chờ xử lý' && (
          <div className="flex gap-2">
            <button onClick={() => handleAction('receive', 'Đã tiếp nhận yêu cầu!')} className="btn-secondary">Tiếp nhận</button>
            <button onClick={() => setModal('supplement')} className="btn-secondary text-amber-600 border-amber-200">Yêu cầu bổ sung</button>
            <button onClick={() => setModal('approve')} className="btn-primary">Xác minh & Chấp nhận</button>
            <button onClick={() => setModal('reject')} className="btn-secondary text-red-600 border-red-200">Từ chối</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left */}
        <div className="col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4 uppercase tracking-wide">Thông tin sinh viên</h2>
            <dl className="grid grid-cols-3 gap-3 text-sm">
              {[['MSSV', v.mssv], ['Họ tên', v.student], ['Đơn vị tổ chức', v.unit], ['Ngày gửi', new Date(v.submittedDate).toLocaleDateString('vi-VN')], ['Người xử lý', v.handler]].map(([k, val]) => (
                <div key={k}><dt className="text-slate-500 text-xs">{k}</dt><dd className="text-slate-800 font-medium mt-0.5">{val}</dd></div>
              ))}
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4 uppercase tracking-wide">Hoạt động khai báo</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[['Tên hoạt động', v.activity], ['Đơn vị', v.unit], ['Loại hoạt động', v.type], ['Địa điểm', v.location], ['Bắt đầu', v.startDate], ['Kết thúc', v.endDate], ['Nội dung tham gia', v.content], ['Mô tả thêm', v.description]].filter(([, val]) => val).map(([k, val]) => (
                <div key={k}><dt className="text-slate-500 text-xs">{k}</dt><dd className="text-slate-800 font-medium mt-0.5">{val}</dd></div>
              ))}
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4 uppercase tracking-wide">Minh chứng</h2>
            <Evidence files={v.files} />
          </div>

          {v.reviewNote && (
            <div className="card p-5">
              <h2 className="font-semibold text-slate-700 text-sm mb-2 uppercase tracking-wide">Phản hồi của cán bộ</h2>
              <p className="text-slate-600 text-sm">{v.reviewNote}</p>
            </div>
          )}
        </div>

        {/* Status */}
        <div>
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4 uppercase tracking-wide">Trạng thái xử lý</h2>
            <div className="text-sm text-slate-600 space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Ngày gửi</span><span className="font-medium text-slate-800">{new Date(v.submittedDate).toLocaleDateString('vi-VN')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Người xử lý</span><span className="font-medium text-slate-800">{v.handler}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Trạng thái</span>{statusBadge(v.status)}</div>
            </div>
          </div>
        </div>
      </div>

      {modal === 'reject' && (
        <Modal title="Từ chối khai báo" onClose={() => setModal(null)}>
          <p className="text-slate-600 text-sm mb-3">Vui lòng nhập lý do từ chối để thông báo cho sinh viên.</p>
          <textarea className="input min-h-[100px] resize-none mb-4" placeholder="Nhập lý do từ chối..." value={reason} onChange={e => setReason(e.target.value)} />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(null)} className="btn-secondary">Hủy</button>
            <button onClick={() => handleAction('reject', 'Đã từ chối khai báo!')} disabled={!reason} className="btn-danger">Xác nhận từ chối</button>
          </div>
        </Modal>
      )}

      {modal === 'supplement' && (
        <Modal title="Yêu cầu bổ sung thông tin" onClose={() => setModal(null)}>
          <p className="text-slate-600 text-sm mb-3">Nhập nội dung cần sinh viên bổ sung.</p>
          <textarea className="input min-h-[100px] resize-none mb-4" placeholder="Ví dụ: Cần bổ sung ảnh chứng nhận có đóng dấu BTC..." value={reason} onChange={e => setReason(e.target.value)} />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(null)} className="btn-secondary">Hủy</button>
            <button onClick={() => handleAction('supplement', 'Đã gửi yêu cầu bổ sung!')} disabled={!reason} className="btn-primary">Gửi yêu cầu</button>
          </div>
        </Modal>
      )}

      {modal === 'approve' && (
        <Modal title="Xác nhận xác minh & chấp nhận" onClose={() => setModal(null)}>
          <p className="text-slate-600 text-sm mb-4">Bạn xác nhận khai báo của sinh viên <strong>{v.student}</strong> là hợp lệ và chấp nhận?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(null)} className="btn-secondary">Hủy</button>
            <button onClick={() => handleAction('approve', 'Đã xác minh và chấp nhận!')} className="btn-primary">Xác nhận chấp nhận</button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
