import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Evidence from '../../components/ui/Evidence'
import { getDeclaration, type DeclarationRow } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'

const timeline = [
  { step: 'Sinh viên gửi', time: '10/09/2024 08:30', done: true, note: '' },
  { step: 'Cán bộ tiếp nhận', time: '10/09/2024 14:00', done: true, note: 'Nguyễn Thị Thu đã tiếp nhận' },
  { step: 'Kiểm tra', time: '11/09/2024 09:00', done: true, note: 'Đang kiểm tra thông tin' },
  { step: 'Xác minh', time: '12/09/2024 10:30', done: true, note: '' },
  { step: 'Chấp nhận', time: '12/09/2024 11:00', done: true, note: 'Đã xác minh và chấp nhận' },
]

const timelineNeedSupplement = [
  { step: 'Sinh viên gửi', time: '02/10/2024 10:00', done: true, note: '' },
  { step: 'Cán bộ tiếp nhận', time: '02/10/2024 16:00', done: true, note: 'Trần Minh Quang đã tiếp nhận' },
  { step: 'Yêu cầu bổ sung', time: '03/10/2024 09:30', done: true, note: 'Cần bổ sung ảnh chứng nhận từ BTC', isRequest: true },
  { step: 'Xác minh', time: '—', done: false, note: '' },
  { step: 'Kết quả', time: '—', done: false, note: '' },
]

export default function DeclarationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [decl, setDecl] = useState<DeclarationRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      setLoading(true)
      getDeclaration(id)
        .then(setDecl)
        .catch(() => setDecl(null))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) {
    return (
      <div className="page-container max-w-4xl">
        <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
        <div className="card p-8 text-center text-slate-400 text-sm">Đang tải chi tiết khai báo...</div>
      </div>
    )
  }

  if (!decl) {
    return (
      <div className="page-container max-w-4xl">
        <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
        <div className="card p-8 text-center text-slate-400 text-sm">Không tìm thấy khai báo.</div>
      </div>
    )
  }

  const tl = decl.status === 'Cần bổ sung' ? timelineNeedSupplement : timeline

  return (
    <div className="page-container max-w-4xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>

      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-xs text-slate-500 font-mono mb-1">{decl.code}</div>
          <h1 className="text-xl font-bold text-slate-800">{decl.activity}</h1>
          <div className="mt-2">{statusBadge(decl.status)}</div>
        </div>
        {decl.status === 'Cần bổ sung' && (
          <button onClick={() => navigate('/student/declarations/create')} className="btn-primary">Bổ sung thông tin</button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4">Thông tin hoạt động</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-slate-500 text-xs">Đơn vị tổ chức</dt><dd className="text-slate-800 font-medium mt-0.5">{decl.unit}</dd></div>
              <div><dt className="text-slate-500 text-xs">Ngày gửi</dt><dd className="text-slate-800 font-medium mt-0.5">{decl.submittedDate}</dd></div>
              <div><dt className="text-slate-500 text-xs">Người xử lý</dt><dd className="text-slate-800 font-medium mt-0.5">{decl.handler}</dd></div>
              <div><dt className="text-slate-500 text-xs">Trạng thái</dt><dd className="mt-0.5">{statusBadge(decl.status)}</dd></div>
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4">Minh chứng</h2>
            <div className="space-y-2">
              <Evidence files={decl.files} />
              {decl.status === 'Cần bổ sung' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
                  ⚠️ <strong>Cán bộ yêu cầu bổ sung:</strong> {decl.reviewNote}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 text-sm mb-4">Timeline xử lý</h2>
            <div className="space-y-0">
              {tl.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${t.done ? (t.isRequest ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white') : 'bg-slate-200 text-slate-400'}`}>
                      {t.done ? (t.isRequest ? '!' : '✓') : i + 1}
                    </div>
                    {i < tl.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" style={{ minHeight: 20 }} />}
                  </div>
                  <div className="pb-4">
                    <div className={`text-sm font-medium ${t.done ? 'text-slate-800' : 'text-slate-400'}`}>{t.step}</div>
                    {t.time !== '—' && <div className="text-xs text-slate-400">{t.time}</div>}
                    {t.note && <div className="text-xs text-slate-500 mt-0.5 italic">{t.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
