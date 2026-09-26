import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getActivity, registerActivity, cancelRegisterActivity, isRegisteredActivity, type ActivityDetail } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

export default function StudentActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [act, setAct] = useState<ActivityDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [registered, setRegistered] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (id) {
      setLoading(true)
      setRegistered(isRegisteredActivity(id))
      getActivity(id)
        .then(data => {
          setAct(data)
          if (data) setRegistered(isRegisteredActivity(data.id))
        })
        .catch(() => setAct(null))
        .finally(() => setLoading(false))
    }
  }, [id])

  const handleRegister = async () => {
    if (!act) return
    await registerActivity(act)
    setRegistered(true)
    setAct(prev => prev ? { ...prev, registered: prev.registered + 1 } : null)
    setShowModal(false)
    setToast('Đăng ký tham gia thành công!')
  }

  const handleCancel = async () => {
    if (!act) return
    await cancelRegisterActivity(act.id)
    setRegistered(false)
    setAct(prev => prev ? { ...prev, registered: Math.max(0, prev.registered - 1) } : null)
    setShowCancel(false)
    setToast('Đã hủy đăng ký.')
  }

  if (loading) {
    return (
      <div className="page-container max-w-4xl">
        <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
        <div className="card p-8 text-center text-slate-400 text-sm">Đang tải chi tiết hoạt động...</div>
      </div>
    )
  }

  if (!act) {
    return (
      <div className="page-container max-w-4xl">
        <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
        <div className="card p-8 text-center text-slate-400 text-sm">Không tìm thấy hoạt động.</div>
      </div>
    )
  }

  return (
    <div className="page-container max-w-4xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>

      <div className="card overflow-hidden mb-5">
        {act.imageUrl && (
          <div className="w-full h-64 sm:h-80 overflow-hidden bg-slate-100 relative">
            <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug">{act.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                {statusBadge(act.status)}
                <span className="badge bg-slate-100 text-slate-600 border border-slate-200">{act.category}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {!registered ? (
                <button onClick={() => setShowModal(true)} className="btn-primary font-semibold">Đăng ký tham gia</button>
              ) : (
                <>
                  <span className="btn-secondary cursor-default !text-green-600 !border-green-200 !bg-green-50 font-semibold">✓ Đã đăng ký</span>
                  <button onClick={() => setShowCancel(true)} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50">Hủy đăng ký</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4 uppercase tracking-wide">Thông tin hoạt động</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Đơn vị tổ chức', act.unit ?? 'Chưa xác định'],
                ['Thời gian', new Date(act.startAt).toLocaleString('vi-VN')],
                ['Địa điểm', act.location ?? 'Chưa xác định'],
                ['Số lượng', `${act.registered}/${act.capacity ?? '—'} người`],
                ['Đối tượng', 'Tất cả sinh viên'],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-slate-500 text-xs font-medium">{k}</dt>
                  <dd className="text-slate-800 font-medium mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-3 uppercase tracking-wide">Mô tả</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{act.description ?? 'Không có mô tả.'}</p>
          </div>
        </div>

        <div>
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4 uppercase tracking-wide">Tiêu chí liên quan</h2>
            <div className="space-y-3">
              {act.category === 'Tình nguyện' && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <div className="font-semibold text-blue-800">Tình nguyện & Cộng đồng</div>
                  <div className="text-blue-600 text-xs mt-1">Hoạt động tình nguyện</div>
                  <div className="text-blue-700 text-xs mt-1 font-medium">+1 lần tham gia</div>
                </div>
              )}
              {act.category === 'Học thuật' && (
                <div className="bg-purple-50 rounded-lg p-3 text-sm">
                  <div className="font-semibold text-purple-800">Học thuật & Chuyên môn</div>
                  <div className="text-purple-600 text-xs mt-1">Seminar / Hội thảo</div>
                  <div className="text-purple-700 text-xs mt-1 font-medium">+1 lần tham gia</div>
                </div>
              )}
              {act.category === 'Văn hóa – Văn nghệ' && (
                <div className="bg-green-50 rounded-lg p-3 text-sm">
                  <div className="font-semibold text-green-800">Văn hóa & Thể thao</div>
                  <div className="text-green-600 text-xs mt-1">Hoạt động văn hóa</div>
                  <div className="text-green-700 text-xs mt-1 font-medium">+1 lần tham gia</div>
                </div>
              )}
              <p className="text-xs text-slate-400 italic">Thông tin hỗ trợ theo dõi, không phải chấm điểm rèn luyện chính thức.</p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal title="Xác nhận đăng ký tham gia" onClose={() => setShowModal(false)}>
          <p className="text-slate-600 text-sm mb-4">Bạn có chắc chắn muốn đăng ký tham gia hoạt động <strong>"{act.title}"</strong>?</p>
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 mb-4">
            📅 {new Date(act.startAt).toLocaleString('vi-VN')}<br/>📍 {act.location ?? 'Chưa xác định'}
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
            <button onClick={handleRegister} className="btn-primary">Xác nhận đăng ký</button>
          </div>
        </Modal>
      )}

      {showCancel && (
        <Modal title="Hủy đăng ký" onClose={() => setShowCancel(false)}>
          <p className="text-slate-600 text-sm mb-4">Bạn có chắc chắn muốn hủy đăng ký hoạt động này không?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowCancel(false)} className="btn-secondary">Không</button>
            <button onClick={handleCancel} className="btn-danger">Hủy đăng ký</button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
