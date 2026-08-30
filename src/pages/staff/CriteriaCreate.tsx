import { useNavigate } from 'react-router-dom'
import { Toast } from '../../components/ui/Toast'
import { useState } from 'react'

export default function StaffCriteriaCreate() {
  const navigate = useNavigate()
  const [toast, setToast] = useState('')
  const handleSave = () => { setToast('Đã tạo tiêu chí!'); setTimeout(() => navigate('/staff/criteria'), 1200) }
  return (
    <div className="page-container max-w-2xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Thêm tiêu chí mới</h1>
      <div className="card p-6 space-y-4">
        {[['Học kỳ', 'select', ['HK1 2024-2025', 'HK2 2024-2025']], ['Nhóm tiêu chí', 'select', ['Tình nguyện & Cộng đồng', 'Học thuật & Chuyên môn', 'Văn hóa & Thể thao', 'Kỹ năng & Ngoại khóa']], ['Tên tiêu chí', 'text', []]].map(([label, type, opts]) => (
          <div key={label as string}>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{label as string}</label>
            {type === 'select' ? (
              <select className="select w-full">{(opts as string[]).map(o => <option key={o}>{o}</option>)}</select>
            ) : (
              <input className="input" placeholder={`Nhập ${(label as string).toLowerCase()}`} />
            )}
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả</label>
          <textarea className="input min-h-[80px] resize-none" placeholder="Mô tả tiêu chí..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mức yêu cầu</label>
            <input type="number" className="input" placeholder="1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Cách tính</label>
            <select className="select w-full"><option>Đếm số lần</option><option>Tổng điểm</option></select>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
          <button onClick={() => navigate(-1)} className="btn-secondary">Hủy</button>
          <button onClick={handleSave} className="btn-primary">Lưu tiêu chí</button>
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
