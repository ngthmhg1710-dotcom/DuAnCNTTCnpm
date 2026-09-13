interface PaginationProps {
  page: number
  total: number
  perPage?: number
  onChange: (p: number) => void
}

export function Pagination({ page, total, perPage = 10, onChange }: PaginationProps) {
  const pages = Math.ceil(total / perPage)
  if (pages <= 1) return null
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
      <span className="text-center sm:text-left text-xs sm:text-sm">Hiển thị {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} trong {total} kết quả</span>
      <div className="flex gap-1 flex-wrap justify-center">
        <button
          onClick={() => onChange(page - 1)} disabled={page === 1}
          className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs sm:text-sm"
        >‹</button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onChange(p)}
            className={`px-3 py-1 rounded border text-xs sm:text-sm ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 hover:bg-slate-50'}`}>
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(page + 1)} disabled={page === pages}
          className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs sm:text-sm"
        >›</button>
      </div>
    </div>
  )
}
