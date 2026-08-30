import { useNavigate } from 'react-router-dom'

const groups = [
  { id: 1, name: 'Tình nguyện & Cộng đồng', required: 2, current: 2, pct: 100, color: 'blue' },
  { id: 2, name: 'Học thuật & Chuyên môn', required: 3, current: 2, pct: 67, color: 'purple' },
  { id: 3, name: 'Văn hóa & Thể thao', required: 1, current: 1, pct: 100, color: 'green' },
  { id: 4, name: 'Kỹ năng & Ngoại khóa', required: 1, current: 0, pct: 0, color: 'amber' },
]

const colorMap: Record<string, { bg: string; bar: string; text: string; tag: string }> = {
  blue: { bg: 'bg-blue-50', bar: '#3b82f6', text: 'text-blue-700', tag: 'bg-blue-100 text-blue-700' },
  purple: { bg: 'bg-purple-50', bar: '#a855f7', text: 'text-purple-700', tag: 'bg-purple-100 text-purple-700' },
  green: { bg: 'bg-green-50', bar: '#22c55e', text: 'text-green-700', tag: 'bg-green-100 text-green-700' },
  amber: { bg: 'bg-amber-50', bar: '#f59e0b', text: 'text-amber-700', tag: 'bg-amber-100 text-amber-700' },
}

const overall = Math.round((groups.reduce((s, g) => s + g.pct, 0) / groups.length))

export default function StudentCriteria() {
  const navigate = useNavigate()
  const radius = 52, stroke = 8
  const circ = 2 * Math.PI * radius
  const dash = (overall / 100) * circ

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tiến độ hoạt động của tôi</h1>
        <p className="text-slate-500 text-sm mt-1">Thông tin hỗ trợ theo dõi – không phải chấm điểm rèn luyện chính thức</p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {/* Overall circle */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <svg width="130" height="130" className="mb-3">
            <circle cx="65" cy="65" r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
            <circle cx="65" cy="65" r={radius} fill="none" stroke="#2563eb" strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 65 65)" />
          </svg>
          <div className="text-3xl font-bold text-slate-800" style={{ marginTop: -90 }}>{overall}%</div>
          <div style={{ marginTop: 50 }} className="text-sm text-slate-500 text-center">Tiến độ tổng thể</div>
          <div className="text-xs text-slate-400 mt-1">HK1 2024-2025</div>
        </div>

        {/* Groups */}
        {groups.map(g => {
          const c = colorMap[g.color]
          return (
            <div key={g.id} className={`card p-5 ${c.bg}`}>
              <div className={`text-xs font-semibold ${c.text} mb-3`}>{g.name}</div>
              <div className="flex items-end justify-between mb-2">
                <div className="text-2xl font-bold text-slate-800">{g.current}<span className="text-sm text-slate-400">/{g.required}</span></div>
                <div className={`text-sm font-semibold ${g.pct === 100 ? 'text-green-600' : g.pct > 0 ? 'text-amber-600' : 'text-red-500'}`}>{g.pct}%</div>
              </div>
              <div className="progress-bar mb-3">
                <div className="progress-fill" style={{ width: `${g.pct}%`, background: c.bar }} />
              </div>
              <div className="text-xs text-slate-500 mb-3">
                {g.required - g.current > 0 ? `Còn thiếu ${g.required - g.current} hoạt động` : '✓ Đã hoàn thành'}
              </div>
              <button onClick={() => navigate(`/student/criteria/${g.id}`)} className="btn-secondary w-full justify-center text-xs">Xem chi tiết</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
