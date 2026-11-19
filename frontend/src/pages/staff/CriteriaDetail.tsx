import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { statusBadge } from '../../components/ui/Badge'
import { getCriteria, type CriteriaRow } from '../../lib/api'

export default function StaffCriteriaDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [criteria, setCriteria] = useState<CriteriaRow | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getCriteria()
      .then(items => setCriteria(items.find(item => item.id === Number(id)) ?? null))
      .catch(() => setError('Không tải được thông tin tiêu chí'))
  }, [id])

  if (error) {
    return <div className="page-container"><div className="card p-6 text-red-600">{error}</div></div>
  }

  if (!criteria) {
    return <div className="page-container"><div className="card p-6 text-slate-500">Đang tải thông tin tiêu chí...</div></div>
  }

  return (
    <div className="page-container max-w-4xl">
      <button onClick={() => navigate(-1)} className="btn-secondary mb-5 text-sm">← Quay lại</button>

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Chi tiết tiêu chí</h1>
        <p className="text-slate-500 text-sm mt-1">Thông tin cấu hình tiêu chí rèn luyện theo Quy chế TDTU</p>
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">{criteria.group}</div>
            <h2 className="text-xl font-bold text-slate-800">{criteria.name}</h2>
          </div>
          {statusBadge(criteria.status)}
        </div>

        {criteria.description && (
          <div className="mb-5 p-4 rounded-xl bg-slate-50 text-sm text-slate-600 leading-relaxed">
            {criteria.description}
          </div>
        )}

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <dt className="text-xs text-slate-500">Mức yêu cầu</dt>
            <dd className="text-lg font-bold text-slate-800 mt-1">{criteria.requirement} lần</dd>
          </div>
          <div className="stat-card">
            <dt className="text-xs text-slate-500">Hoạt động liên quan</dt>
            <dd className="text-lg font-bold text-slate-800 mt-1">{criteria.activities}</dd>
          </div>
          <div className="stat-card">
            <dt className="text-xs text-slate-500">Học kỳ</dt>
            <dd className="text-sm font-bold text-slate-800 mt-2">{criteria.semester}</dd>
          </div>
        </dl>

        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
          <button onClick={() => navigate(`/staff/criteria/${criteria.id}/edit`)} className="btn-primary">
            Chỉnh sửa tiêu chí
          </button>
        </div>
      </div>
    </div>
  )
}
