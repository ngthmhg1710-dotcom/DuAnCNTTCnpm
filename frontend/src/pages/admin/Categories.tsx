import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

const cats = {
  'Loại hoạt động': ['Tình nguyện', 'Học thuật', 'Văn hóa – Văn nghệ', 'Kỹ năng & Ngoại khóa'],
  'Đơn vị tổ chức': ['Đoàn Trường TDTU', 'Đoàn Khoa CNTT', 'CLB IT TDTU', 'CLB Kỹ năng TDTU', 'Hội Chữ thập đỏ TDTU'],
  'Nhóm tiêu chí': ['Tình nguyện & Cộng đồng', 'Học thuật & Chuyên môn', 'Văn hóa & Thể thao', 'Kỹ năng & Ngoại khóa'],
}

export default function AdminCategories() {
  const [active, setActive] = useState('Loại hoạt động')
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState('')

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý danh mục</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary self-start sm:self-auto">+ Thêm danh mục</button>
      </div>

      <div className="flex gap-2 sm:gap-3 mb-5 flex-wrap">
        {Object.keys(cats).map(k => (
          <button key={k} onClick={() => setActive(k)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${active === k ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>{k}</button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px] text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">Tên danh mục</th>
              <th className="text-left px-4 py-3">Nhóm</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {cats[active as keyof typeof cats].map((item, i) => (
              <tr key={i} className="table-row">
                <td className="px-4 py-3 font-medium text-slate-800">{item}</td>
                <td className="px-4 py-3 text-slate-600">{active}</td>
                <td className="px-4 py-3"><span className="badge bg-green-50 text-green-700 border border-green-200">Đang dùng</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="btn-secondary text-xs py-1 px-2">Sửa</button>
                    <button onClick={() => setToast('Đã xóa danh mục!')} className="btn-secondary text-xs py-1 px-2 text-red-500">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {showAdd && (
        <Modal title={`Thêm ${active} mới`} onClose={() => setShowAdd(false)}>
          <input className="input mb-4" placeholder={`Tên ${active.toLowerCase()}`} />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Hủy</button>
            <button onClick={() => { setShowAdd(false); setToast('Đã thêm danh mục!') }} className="btn-primary">Thêm</button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
