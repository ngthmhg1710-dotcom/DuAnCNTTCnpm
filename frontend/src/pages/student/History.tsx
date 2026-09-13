import { statusBadge } from '../../components/ui/Badge'

const history = [
  { date: '12/09/2024', event: 'Khai báo KB-2024-001 được xác minh', type: 'Xác minh', status: 'Đã xác minh' },
  { date: '10/09/2024', event: 'Gửi khai báo KB-2024-001', type: 'Khai báo', status: 'Đã gửi' },
  { date: '20/08/2024', event: 'Tham gia Cuộc thi lập trình ACM ICPC', type: 'Tham gia', status: 'Đã tham gia' },
  { date: '10/07/2024', event: 'Tham gia Hội thảo kỹ năng mềm', type: 'Tham gia', status: 'Đã tham gia' },
  { date: '15/06/2024', event: 'Tham gia Ngày hội tình nguyện mùa hè 2024', type: 'Tham gia', status: 'Đã tham gia' },
  { date: '05/03/2024', event: 'Tham gia Hiến máu nhân đạo lần 2', type: 'Tham gia', status: 'Đã xác minh' },
  { date: '11/11/2023', event: 'Tham gia Ngày văn hóa các dân tộc VN', type: 'Tham gia', status: 'Đã xác minh' },
]

const typeColor: Record<string, string> = {
  'Xác minh': 'bg-blue-50 text-blue-600',
  'Khai báo': 'bg-purple-50 text-purple-600',
  'Tham gia': 'bg-green-50 text-green-600',
}

export default function StudentHistory() {
  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Lịch sử hoạt động</h1>
        <p className="text-slate-500 text-sm mt-1">Toàn bộ lịch sử tham gia và khai báo</p>
      </div>

      <div className="card mb-4 p-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <select className="select w-full sm:w-auto"><option>Tất cả học kỳ</option><option>HK1 2024-2025</option></select>
        <select className="select w-full sm:w-auto"><option>Tất cả loại</option><option>Tham gia</option><option>Khai báo</option><option>Xác minh</option></select>
        <select className="select w-full sm:w-auto"><option>Tất cả trạng thái</option></select>
      </div>

      <div className="card">
        <div className="divide-y divide-slate-50">
          {history.map((h, i) => (
            <div key={i} className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${h.type === 'Tham gia' ? 'bg-green-500' : h.type === 'Khai báo' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                <div className="text-xs text-slate-400 w-24 shrink-0 font-mono">{h.date}</div>
              </div>
              <div className="flex-1 text-sm text-slate-700 font-medium">{h.event}</div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`badge text-xs ${typeColor[h.type]}`}>{h.type}</span>
                {statusBadge(h.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
