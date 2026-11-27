import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  downloadReport, getAlertConfig, getAttentionStudents, saveAlertConfig,
  type AlertConfig, type AttentionResult, type StatFilters,
} from '../../lib/api'
import StatFilterBar from '../../components/ui/StatFilterBar'
import { Toast } from '../../components/ui/Toast'

const PRIORITY_STYLE = {
  Cao: 'bg-red-50 text-red-700 border border-red-200',
  'Trung bình': 'bg-amber-50 text-amber-700 border border-amber-200',
  Thấp: 'bg-slate-50 text-slate-600 border border-slate-200',
} as const

const FIELDS: { key: keyof AlertConfig; label: string; hint: string; min: number; max: number }[] = [
  { key: 'lowBelow', label: 'Tham gia thấp: dưới', hint: 'số hoạt động đã tham gia', min: 1, max: 50 },
  { key: 'mediumBelow', label: 'Mức Cao: từ', hint: 'số hoạt động (dưới mức này là Trung bình)', min: 1, max: 50 },
  { key: 'targetPoints', label: 'Điểm mục tiêu', hint: 'điểm ước tính tối thiểu (0-100)', min: 0, max: 100 },
  { key: 'manyPending', label: 'Nhiều khai báo chờ: từ', hint: 'số khai báo đang chờ xử lý', min: 1, max: 100 },
  { key: 'riskAfterPct', label: 'Xét nguy cơ khi học kỳ đã qua', hint: '% thời gian học kỳ (0-100)', min: 0, max: 100 },
]

export default function StaffAttentionStudents() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<StatFilters>({})
  const [flag, setFlag] = useState('')
  const [data, setData] = useState<AttentionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<AlertConfig | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [toast, setToast] = useState('')
  const [version, setVersion] = useState(0) // tăng sau khi đổi ngưỡng để tải lại

  useEffect(() => {
    setLoading(true)
    getAttentionStudents(filters, flag)
      .then(d => { setData(d); setConfig(c => c ?? d.config) })
      .catch(() => setToast('Không tải được danh sách.'))
      .finally(() => setLoading(false))
  }, [filters, flag, version])

  const saveConfig = async () => {
    if (!config) return
    if (config.lowBelow > config.mediumBelow) return setToast('Ngưỡng "Thấp" phải nhỏ hơn hoặc bằng ngưỡng "Cao".')
    try {
      setConfig(await saveAlertConfig(config))
      setToast('Đã lưu ngưỡng. Danh sách đã được tính lại.')
      setVersion(v => v + 1)
    } catch (e: any) {
      setToast(e?.response?.data?.message?.toString() || 'Không lưu được ngưỡng.')
    }
  }
  const resetConfig = () => getAlertConfig().then(setConfig)

  const students = data?.students ?? []
  return (
    <div className="page-container">
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sinh viên cần quan tâm</h1>
          <p className="text-slate-500 text-sm mt-1">{data?.semester ?? '...'} · {students.length} sinh viên bị gắn cờ theo các ngưỡng cảnh báo</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowConfig(s => !s)} className="btn-secondary">⚙️ Ngưỡng cảnh báo</button>
          <button onClick={() => downloadReport('low-participation', filters).catch(() => setToast('Không xuất được Excel.'))} className="btn-secondary">Xuất Excel</button>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-sm px-4 py-2 mb-5">
        Thông tin chỉ mang tính tham khảo để cán bộ theo dõi, hệ thống không tự quyết định hay thay đổi kết quả rèn luyện của sinh viên.
      </div>

      {showConfig && config && (
        <div className="card p-5 mb-5">
          <div className="font-semibold text-slate-800 mb-1">Ngưỡng cảnh báo</div>
          <p className="text-xs text-slate-500 mb-4">Đổi ngưỡng rồi bấm Lưu: danh sách và báo cáo được tính lại ngay theo ngưỡng mới.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FIELDS.map(f => (
              <div key={f.key}>
                <label htmlFor={`alert-${f.key}`} className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                <input id={`alert-${f.key}`} type="number" min={f.min} max={f.max} className="input" value={config[f.key]} onChange={e => setConfig({ ...config, [f.key]: Number(e.target.value) })} />
                <div className="text-xs text-slate-400 mt-1">{f.hint}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button onClick={resetConfig} className="btn-secondary">Hoàn tác</button>
            <button onClick={saveConfig} className="btn-primary">Lưu ngưỡng</button>
          </div>
        </div>
      )}

      <StatFilterBar value={filters} onChange={setFilters} showCategory={false} semesterAllLabel="Học kỳ hiện tại" />

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFlag('')} className={`badge border ${flag === '' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}>Tất cả</button>
        {data?.summary?.map(s => (
          <button key={s.code} onClick={() => setFlag(s.code === flag ? '' : s.code)} className={`badge border ${flag === s.code ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}>
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">MSSV</th>
                <th className="text-left px-4 py-3">Họ tên</th>
                <th className="text-left px-4 py-3">Lớp</th>
                <th className="text-left px-4 py-3">Khóa</th>
                <th className="text-left px-4 py-3">Số HĐ</th>
                <th className="text-left px-4 py-3">Điểm ước tính</th>
                <th className="text-left px-4 py-3">Mức ưu tiên</th>
                <th className="text-left px-4 py-3">Lý do bị gắn cờ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && <tr><td colSpan={9} className="text-center py-10 text-slate-400">Đang tải...</td></tr>}
              {!loading && students.map(s => (
                <tr key={s.id} className="table-row align-top">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.mssv}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.className ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.cohort ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.activities}</td>
                  <td className="px-4 py-3 text-slate-600">{s.score}{data?.target ? <span className="text-xs text-slate-400"> /{data.target}</span> : null}</td>
                  <td className="px-4 py-3"><span className={`badge ${PRIORITY_STYLE[s.priority] ?? PRIORITY_STYLE.Thấp}`}>{s.priority}</span></td>
                  <td className="px-4 py-3 whitespace-normal">
                    <ul className="space-y-1">
                      {(s.flags ?? []).map(f => (
                        <li key={f.code} className="text-xs"><span className="font-semibold text-slate-700">{f.label}:</span> <span className="text-slate-500">{f.reason}</span></li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/staff/students/${s.id}`)} className="btn-secondary text-xs py-1 whitespace-nowrap">Xem chi tiết</button>
                  </td>
                </tr>
              ))}
              {!loading && students.length === 0 && (
                <tr><td colSpan={9} className="text-center py-10 text-slate-400">Không có sinh viên cần quan tâm theo bộ lọc và ngưỡng hiện tại</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-3">Mức ưu tiên theo số cờ: 3 cờ trở lên là Cao, 2 cờ là Trung bình, 1 cờ là Thấp. Điểm ước tính tính từ hoạt động đã điểm danh trong học kỳ, chỉ để tham khảo.</p>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
