import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { activities } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

export default function StudentActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const act = activities.find(a => a.id === Number(id)) ?? activities[0]
  const [registered, setRegistered] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [toast, setToast] = useState('')

  const handleRegister = () => { setRegistered(true); setShowModal(false); setToast('Đăng ký tham gia thành công!') }
  const handleCancel = () => { setRegistered(false); setShowCancel(false); setToast('Đã hủy đăng ký.') }

  return (
    <div className="page-container max-w-4xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>

      <div className="card p-6 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{act.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              {statusBadge(act.status)}
              <span className="badge bg-slate-100 text-slate-500 border border-slate-200">{act.type}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!registered ? (
              <button onClick={() => setShowModal(true)} className="btn-primary">Đăng ký tham gia</button>
            ) : (
              <>
                <span className="btn-secondary cursor-default !text-green-600 !border-green-200 !bg-green-50">✓ Đã đăng ký</span>
                <button onClick={() => setShowCancel(true)} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50">Hủy đăng ký</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4 uppercase tracking-wide">Thông tin hoạt động</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Đơn vị tổ chức', act.unit],
                ['Thời gian', `${act.startDate} · ${act.time}`],
                ['Địa điểm', act.location],
                ['Số lượng', `${act.registered}/${act.capacity} người`],
                ['Đối tượng', 'Sinh viên Khoa CNTT'],
                ['Học kỳ', act.semester],
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
            <p className="text-slate-600 text-sm leading-relaxed">{act.description}</p>
          </div>
        </div>

        <div>
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4 uppercase tracking-wide">Tiêu chí liên quan</h2>
            <div className="space-y-3">
              {act.type === 'Tình nguyện' && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <div className="font-semibold text-blue-800">Tình nguyện & Cộng đồng</div>
                  <div className="text-blue-600 text-xs mt-1">Hoạt động tình nguyện</div>
                  <div className="text-blue-700 text-xs mt-1 font-medium">+1 lần tham gia</div>
                </div>
              )}
              {act.type === 'Học thuật' && (
                <div className="bg-purple-50 rounded-lg p-3 text-sm">
                  <div className="font-semibold text-purple-800">Học thuật & Chuyên môn</div>
                  <div className="text-purple-600 text-xs mt-1">Seminar / Hội thảo</div>
                  <div className="text-purple-700 text-xs mt-1 font-medium">+1 lần tham gia</div>
                </div>
              )}
              {act.type === 'Văn hóa – Văn nghệ' && (
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
          <p className="text-slate-600 text-sm mb-4">Bạn có chắc chắn muốn đăng ký tham gia hoạt động <strong>"{act.name}"</strong>?</p>
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 mb-4">
            📅 {act.startDate} · {act.time}<br/>📍 {act.location}
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
