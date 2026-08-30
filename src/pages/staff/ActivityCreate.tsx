import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Toast } from '../../components/ui/Toast'

export default function StaffActivityCreate() {
  const navigate = useNavigate()
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ name: '', type: '', unit: '', semester: '', startDate: '', endDate: '', time: '', location: '', capacity: '', audience: '', description: '', criteria: '', status: 'Nháp' })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = (publish: boolean) => {
    setToast(publish ? 'Hoạt động đã được công bố!' : 'Đã lưu nháp hoạt động.')
    setTimeout(() => navigate('/staff/activities'), 1200)
  }

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Tạo hoạt động mới</h1>

      <div className="card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên hoạt động <span className="text-red-500">*</span></label>
            <input className="input" placeholder="Nhập tên hoạt động" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Loại hoạt động</label>
            <select className="select w-full" value={form.type} onChange={set('type')}>
              <option value="">Chọn loại</option>
              <option>Tình nguyện</option>
              <option>Học thuật</option>
              <option>Văn hóa – Văn nghệ</option>
              <option>Kỹ năng & Ngoại khóa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Đơn vị tổ chức</label>
            <input className="input" placeholder="Tên đơn vị / CLB" value={form.unit} onChange={set('unit')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Học kỳ</label>
            <select className="select w-full" value={form.semester} onChange={set('semester')}>
              <option>HK1 2024-2025</option>
              <option>HK2 2024-2025</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Số lượng tối đa</label>
            <input type="number" className="input" placeholder="100" value={form.capacity} onChange={set('capacity')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày bắt đầu</label>
            <input type="date" className="input" value={form.startDate} onChange={set('startDate')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày kết thúc</label>
            <input type="date" className="input" value={form.endDate} onChange={set('endDate')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Thời gian</label>
            <input className="input" placeholder="07:30 - 11:30" value={form.time} onChange={set('time')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Địa điểm</label>
            <input className="input" placeholder="Địa điểm tổ chức" value={form.location} onChange={set('location')} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Đối tượng tham gia</label>
            <input className="input" placeholder="Sinh viên Khoa CNTT, toàn trường..." value={form.audience} onChange={set('audience')} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả hoạt động</label>
            <textarea className="input min-h-[100px] resize-none" placeholder="Nội dung, mục tiêu hoạt động..." value={form.description} onChange={set('description')} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tiêu chí liên quan</label>
            <select className="select w-full" value={form.criteria} onChange={set('criteria')}>
              <option value="">Chọn tiêu chí</option>
              <option>Tình nguyện & Cộng đồng</option>
              <option>Học thuật & Chuyên môn</option>
              <option>Văn hóa & Thể thao</option>
              <option>Kỹ năng & Ngoại khóa</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
          <button onClick={() => navigate(-1)} className="btn-secondary">Hủy</button>
          <button onClick={() => handleSave(false)} className="btn-secondary">Lưu nháp</button>
          <button onClick={() => handleSave(true)} className="btn-primary">Công bố</button>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
