import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifications } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

export default function StaffVerificationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const v = verifications.find(x => x.id === id) ?? verifications[0]
  const [modal, setModal] = useState<'reject' | 'supplement' | 'approve' | null>(null)
  const [reason, setReason] = useState('')
  const [toast, setToast] = useState('')

  const handleAction = (action: string) => {
    setModal(null)
    setToast(action)
    setReason('')
  }

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>

      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-xs text-slate-500 font-mono mb-1">{v.id}</div>
          <h1 className="text-xl font-bold text-slate-800">Xác minh: {v.activity}</h1>
          <div className="mt-2">{statusBadge(v.status)}</div>
        </div>
        {v.status === 'Chờ xử lý' && (
          <div className="flex gap-2">
            <button onClick={() => setToast('Đã tiếp nhận yêu cầu!')} className="btn-secondary">Tiếp nhận</button>
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
              {[['MSSV', v.mssv], ['Họ tên', v.student], ['Đơn vị tổ chức', v.unit], ['Ngày gửi', v.submittedDate], ['Người xử lý', v.handler || '—']].map(([k, val]) => (
                <div key={k}><dt className="text-slate-500 text-xs">{k}</dt><dd className="text-slate-800 font-medium mt-0.5">{val}</dd></div>
              ))}
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4 uppercase tracking-wide">Thông tin hoạt động</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[['Tên hoạt động', v.activity], ['Đơn vị', v.unit], ['Loại', 'Học thuật'], ['Thời gian', '2024-10-01']].map(([k, val]) => (
                <div key={k}><dt className="text-slate-500 text-xs">{k}</dt><dd className="text-slate-800 font-medium mt-0.5">{val}</dd></div>
              ))}
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4 uppercase tracking-wide">Minh chứng</h2>
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg text-sm">
              <span className="text-2xl">📄</span>
              <div>
                <div className="font-medium text-slate-700">chung_nhan_tham_gia.pdf</div>
                <div className="text-slate-400 text-xs">245 KB</div>
              </div>
              <button className="ml-auto text-blue-600 text-xs hover:underline">Xem file</button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4 uppercase tracking-wide">Timeline xử lý</h2>
            <div className="space-y-0">
              {[
                { step: 'Sinh viên gửi', time: v.submittedDate, done: true },
                { step: 'Cán bộ tiếp nhận', time: v.handler !== '—' ? 'Đã tiếp nhận' : '—', done: v.handler !== '—' },
                { step: 'Kiểm tra minh chứng', time: '—', done: false },
                { step: 'Xác minh', time: '—', done: false },
                { step: 'Kết quả', time: '—', done: false },
              ].map((t, i, arr) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${t.done ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>{t.done ? '✓' : i + 1}</div>
                    {i < arr.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" style={{ minHeight: 20 }} />}
                  </div>
                  <div className="pb-4">
                    <div className={`text-sm font-medium ${t.done ? 'text-slate-800' : 'text-slate-400'}`}>{t.step}</div>
                    {t.time !== '—' && <div className="text-xs text-slate-400">{t.time}</div>}
                  </div>
                </div>
              ))}
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
            <button onClick={() => handleAction('Đã từ chối khai báo!')} disabled={!reason} className="btn-danger">Xác nhận từ chối</button>
          </div>
        </Modal>
      )}

      {modal === 'supplement' && (
        <Modal title="Yêu cầu bổ sung thông tin" onClose={() => setModal(null)}>
          <p className="text-slate-600 text-sm mb-3">Nhập nội dung cần sinh viên bổ sung.</p>
          <textarea className="input min-h-[100px] resize-none mb-4" placeholder="Ví dụ: Cần bổ sung ảnh chứng nhận có đóng dấu BTC..." value={reason} onChange={e => setReason(e.target.value)} />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(null)} className="btn-secondary">Hủy</button>
            <button onClick={() => handleAction('Đã gửi yêu cầu bổ sung!')} disabled={!reason} className="btn-primary">Gửi yêu cầu</button>
          </div>
        </Modal>
      )}

      {modal === 'approve' && (
        <Modal title="Xác nhận xác minh & chấp nhận" onClose={() => setModal(null)}>
          <p className="text-slate-600 text-sm mb-4">Bạn xác nhận khai báo của sinh viên <strong>{v.student}</strong> là hợp lệ và chấp nhận?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(null)} className="btn-secondary">Hủy</button>
            <button onClick={() => handleAction('Đã xác minh và chấp nhận!')} className="btn-primary">Xác nhận chấp nhận</button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
