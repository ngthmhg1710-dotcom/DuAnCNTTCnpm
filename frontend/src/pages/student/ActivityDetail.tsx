import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getActivity, registerActivity, cancelRegisterActivity, getStudentRegistrations, type ActivityDetail } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { findDrlOption } from '../../data/drl'

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
      getActivity(id)
        .then(setAct)
        .catch(() => setAct(null))
        .finally(() => setLoading(false))
      // Trạng thái đăng ký lấy từ server (đúng trên mọi thiết bị), không dựa vào bộ nhớ trình duyệt.
      getStudentRegistrations().then(rows => setRegistered(rows.some(r => r.activityId === Number(id)))).catch(() => {})
    }
  }, [id])

  const errorOf = (e: any, fallback: string) => e?.response?.data?.message?.toString() || fallback

  const handleRegister = async () => {
    if (!act) return
    try {
      await registerActivity(act)
      setRegistered(true)
      setAct(prev => prev ? { ...prev, registered: prev.registered + 1 } : null)
      setToast('Đăng ký tham gia thành công!')
    } catch (e) {
      setToast(errorOf(e, 'Đăng ký thất bại, vui lòng thử lại.'))
    } finally {
      setShowModal(false)
    }
  }

  const handleCancel = async () => {
    if (!act) return
    try {
      await cancelRegisterActivity(act.id)
      setRegistered(false)
      setAct(prev => prev ? { ...prev, registered: Math.max(0, prev.registered - 1) } : null)
      setToast('Đã hủy đăng ký.')
    } catch (e) {
      setToast(errorOf(e, 'Hủy đăng ký thất bại, vui lòng thử lại.'))
    } finally {
      setShowCancel(false)
    }
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

  const rule = findDrlOption(act.ruleCode)
  const closedReason =
    act.status === 'Đã hủy' ? 'Hoạt động đã bị hủy'
    : act.status === 'Đã kết thúc' ? 'Hoạt động đã kết thúc'
    : act.status === 'Đóng đăng ký' ? 'Đã đóng đăng ký'
    : act.capacity && act.registered >= act.capacity ? 'Đã đủ số lượng'
    : undefined
  const audience = [
    act.targetClasses?.length ? `Lớp ${act.targetClasses.join(', ')}` : '',
    act.targetCohorts?.length ? `Khóa ${act.targetCohorts.join(', ')}` : '',
  ].filter(Boolean).join(' · ') || 'Tất cả sinh viên'
  const fmt = (iso: string) => new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="page-container max-w-4xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>

      <div className="card overflow-hidden mb-5">
        {act.imageUrl && (
          <div className="w-full h-64 sm:h-80 overflow-hidden bg-slate-100 relative">
            <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover" />
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
                <button onClick={() => setShowModal(true)} disabled={!!closedReason} title={closedReason} className="btn-primary font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  {closedReason ?? 'Đăng ký tham gia'}
                </button>
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
            <h2 className="font-semibold text-slate-700 text-sm mb-4">Thông tin hoạt động</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Đơn vị tổ chức', act.unit ?? 'Chưa xác định'],
                ['Bắt đầu', fmt(act.startAt)],
                ['Kết thúc', act.endAt ? fmt(act.endAt) : 'Chưa xác định'],
                ['Địa điểm', act.location ?? 'Chưa xác định'],
                ['Số lượng', `${act.registered}/${act.capacity ?? '—'} người`],
                ['Đối tượng', audience],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-slate-500 text-xs font-medium">{k}</dt>
                  <dd className="text-slate-800 font-medium mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-3">Mô tả</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{act.description ?? 'Không có mô tả.'}</p>
          </div>
        </div>

        <div>
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4">Tiêu chí liên quan</h2>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-3 text-sm">
                <div className="font-semibold text-blue-800">{rule ? `${rule.section.article}. ${rule.section.name}` : act.category}</div>
                {rule && <div className="text-blue-600 text-xs mt-1">{rule.item.label} · {rule.option.label}</div>}
                <div className="text-blue-700 text-xs mt-1 font-medium">
                  {act.points ? `+${act.points} điểm/lần (mục tối đa 20 điểm)` : 'Chưa gắn điểm theo quy chế'}
                </div>
              </div>
              <p className="text-xs text-slate-400 italic">Thông tin hỗ trợ theo dõi, không phải chấm điểm rèn luyện chính thức.</p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal title="Xác nhận đăng ký tham gia" onClose={() => setShowModal(false)}>
          <p className="text-slate-600 text-sm mb-4">Bạn có chắc chắn muốn đăng ký tham gia hoạt động <strong>"{act.title}"</strong>?</p>
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 mb-4">
            Thời gian: {new Date(act.startAt).toLocaleString('vi-VN')}<br/>Địa điểm: {act.location ?? 'Chưa xác định'}
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
