import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCriteriaProgress, type CriteriaProgress } from '../../lib/api'

const colors = ['blue', 'purple', 'green', 'amber']

const colorMap: Record<string, { bg: string; bar: string; text: string }> = {
  blue: { bg: 'bg-blue-50', bar: '#3b82f6', text: 'text-blue-700' },
  purple: { bg: 'bg-purple-50', bar: '#a855f7', text: 'text-purple-700' },
  green: { bg: 'bg-green-50', bar: '#22c55e', text: 'text-green-700' },
  amber: { bg: 'bg-amber-50', bar: '#f59e0b', text: 'text-amber-700' },
}

export default function StudentCriteria() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<CriteriaProgress[]>([])
  const [semester, setSemester] = useState<string | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    getCriteriaProgress()
      .then(d => { setGroups(d.items); setSemester(d.semester) })
      .catch(() => setError('Không tải được tiến độ. Vui lòng thử lại.'))
  }, [])
  const overall = groups.length ? Math.round(groups.reduce((s, g) => s + g.pct, 0) / groups.length) : 0
  const radius = 52, stroke = 10
  const circ = 2 * Math.PI * radius
  const dash = (overall / 100) * circ
  const completedGroups = groups.filter(g => g.pct === 100).length

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Tiến độ hoạt động của tôi</h1>
        <p className="text-slate-500 text-sm mt-1">Thông tin hỗ trợ theo dõi – không phải chấm điểm rèn luyện chính thức</p>
      </div>

      {/* Overall summary */}
      <div className="card p-5 sm:p-6 mb-5 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0" style={{ width: 130, height: 130 }}>
          <svg width="130" height="130">
            <circle cx="65" cy="65" r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
            <circle
              cx="65" cy="65" r={radius} fill="none" stroke="#2563eb" strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dasharray 0.4s' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-slate-800">
            {overall}%
          </div>
        </div>
        <div className="text-center sm:text-left">
          <div className="text-sm font-semibold text-slate-700">Tiến độ tổng thể</div>
          <div className="text-xs text-slate-400 mt-0.5">{semester ?? 'Chưa có học kỳ'}</div>
          <p className="text-xs text-slate-500 mt-2 max-w-md">
            Đã hoàn thành {completedGroups}/{groups.length} nhóm tiêu chí. Tiếp tục tham gia hoạt động để hoàn thành các nhóm còn lại.
          </p>
        </div>
      </div>

      {error && <div className="card p-5 mb-4 text-sm text-red-600">{error}</div>}
      {!error && groups.length === 0 && <div className="card p-8 text-center text-sm text-slate-500">Chưa có tiêu chí nào cho học kỳ này.</div>}

      {/* Groups */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {groups.map((g, i) => {
          const c = colorMap[colors[i % colors.length]]
          const done = g.pct === 100
          return (
            <div key={g.id} className={`card p-5 ${c.bg} flex flex-col`}>
              <div className={`text-xs font-semibold ${c.text} mb-3 leading-snug min-h-[32px]`}>{g.name}</div>
              <div className="flex items-end justify-between mb-2">
                <div className="text-2xl font-bold text-slate-800">{g.current}<span className="text-sm text-slate-400">/{g.required}</span></div>
                <div className={`text-sm font-semibold ${done ? 'text-green-600' : g.pct > 0 ? 'text-amber-600' : 'text-red-500'}`}>{g.pct}%</div>
              </div>
              <div className="progress-bar mb-3">
                <div className="progress-fill" style={{ width: `${g.pct}%`, background: c.bar }} />
              </div>
              <div className="text-xs text-slate-500 mb-4 flex-1">
                {done ? '✓ Đã hoàn thành' : `Còn thiếu ${g.missing} hoạt động`}
              </div>
              <button onClick={() => navigate(`/student/criteria/${g.id}`)} className="btn-secondary w-full justify-center text-xs mt-auto">Xem chi tiết</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
