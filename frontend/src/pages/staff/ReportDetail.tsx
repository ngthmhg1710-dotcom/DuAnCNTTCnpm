import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { downloadReport, getReport, type ReportData, type ReportType, type StatFilters } from '../../lib/api'
import { Toast } from '../../components/ui/Toast'
import StatFilterBar from '../../components/ui/StatFilterBar'

const TYPES: ReportType[] = ['students', 'history', 'by-semester', 'low-participation', 'verification']
const PAGE = 50

export default function StaffReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const type = TYPES.find(t => t === id)
  const [filters, setFilters] = useState<StatFilters>({})
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!type) return
    setLoading(true)
    setPage(0)
    getReport(type, filters).then(setData).catch(() => { setData(null); setToast('Không tải được báo cáo.') }).finally(() => setLoading(false))
  }, [type, filters])

  if (!type) return <div className="page-container"><p className="text-slate-500">Loại báo cáo không tồn tại.</p><button onClick={() => navigate('/staff/reports')} className="btn-secondary mt-3">Về danh sách báo cáo</button></div>

  const rows = data?.rows ?? []
  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  // Báo cáo xác minh không phân theo loại hoạt động; các báo cáo khác dùng đủ 4 bộ lọc.
  const showCategory = type !== 'verification' && type !== 'low-participation'

  return (
    <div className="page-container">
      <button onClick={() => navigate('/staff/reports')} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1 print:hidden">← Quay lại</button>

      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{data?.title ?? 'Báo cáo'}</h1>
          <p className="text-slate-500 text-sm mt-1">{loading ? 'Đang tải...' : `${rows.length} dòng`}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={() => downloadReport(type, filters).catch(() => setToast('Không xuất được Excel.'))} className="btn-secondary">📥 Excel</button>
          <button onClick={() => window.print()} className="btn-secondary" title="Chọn 'Lưu thành PDF' trong hộp thoại in">🖨️ In / PDF</button>
        </div>
      </div>

      <div className="print:hidden"><StatFilterBar value={filters} onChange={setFilters} showCategory={showCategory} /></div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">#</th>
                {data?.columns.map(c => <th key={c} className="text-left px-4 py-3 whitespace-nowrap">{c}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((r, i) => (
                // Trên màn hình chỉ hiện trang hiện tại; khi in thì in đủ mọi dòng.
                <tr key={i} className={`table-row ${Math.floor(i / PAGE) === page ? '' : 'hidden print:table-row'}`}>
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  {r.map((v, j) => <td key={j} className="px-4 py-3 text-slate-700">{v === '' ? '—' : v}</td>)}
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={(data?.columns.length ?? 0) + 1} className="text-center py-10 text-slate-500">Không có dữ liệu theo bộ lọc này</td></tr>}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500 print:hidden">
            <span>Trang {page + 1}/{pages}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(page - 1)} className="btn-secondary text-xs py-1 px-3">Trước</button>
              <button disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="btn-secondary text-xs py-1 px-3">Sau</button>
            </div>
          </div>
        )}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
