import { useEffect, useState } from 'react'
import { getFilterOptions, type FilterOptions, type StatFilters } from '../../lib/api'

// Ô lọc dùng chung cho Dashboard / Thống kê / Báo cáo. Giá trị lấy từ dữ liệu thật.
export default function StatFilterBar({ value, onChange, showCategory = true, semesterAllLabel = 'Tất cả học kỳ' }: { value: StatFilters; onChange: (f: StatFilters) => void; showCategory?: boolean; semesterAllLabel?: string }) {
  const [opt, setOpt] = useState<FilterOptions | null>(null)
  useEffect(() => { getFilterOptions().then(setOpt).catch(() => setOpt({ semesters: [], classes: [], cohorts: [], categories: [] })) }, [])
  const set = (patch: StatFilters) => onChange({ ...value, ...patch })
  const empty = !value.semesterId && !value.className && !value.cohort && !value.category

  return (
    <div className="card p-4 flex flex-wrap items-center gap-3 mb-5">
      <select className="input w-auto" aria-label="Học kỳ" value={value.semesterId ?? ''} onChange={e => set({ semesterId: e.target.value ? Number(e.target.value) : '' })}>
        <option value="">{semesterAllLabel}</option>
        {opt?.semesters.map(s => <option key={s.id} value={s.id}>{s.name}{s.isCurrent ? ' (hiện tại)' : ''}</option>)}
      </select>
      <select className="input w-auto" aria-label="Khóa" value={value.cohort ?? ''} onChange={e => set({ cohort: e.target.value })}>
        <option value="">Tất cả khóa</option>
        {opt?.cohorts.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select className="input w-auto" aria-label="Lớp" value={value.className ?? ''} onChange={e => set({ className: e.target.value })}>
        <option value="">Tất cả lớp</option>
        {opt?.classes.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      {showCategory && (
        <select className="input w-auto" aria-label="Loại hoạt động" value={value.category ?? ''} onChange={e => set({ category: e.target.value })}>
          <option value="">Tất cả loại hoạt động</option>
          {opt?.categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      )}
      {!empty && <button onClick={() => onChange({})} className="btn-secondary text-xs py-1 px-3">Xóa lọc</button>}
    </div>
  )
}
