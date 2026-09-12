import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Toast } from '../../components/ui/Toast'

export default function DeclarationCreate() {
  const navigate = useNavigate()
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({
    name: '', type: '', unit: '', startDate: '', endDate: '', location: '', content: '', description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<string[]>([])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name) e.name = 'Vui lòng nhập tên hoạt động'
    if (!form.type) e.type = 'Vui lòng chọn loại hoạt động'
    if (!form.unit) e.unit = 'Vui lòng nhập đơn vị tổ chức'
    if (!form.startDate) e.startDate = 'Vui lòng nhập thời gian'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (draft: boolean) => {
    if (!validate()) return
    setToast(draft ? 'Đã lưu nháp.' : 'Khai báo đã được gửi thành công!')
    setTimeout(() => navigate('/student/declarations'), 1200)
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Khai báo hoạt động mới</h1>

      <div className="card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên hoạt động <span className="text-red-500">*</span></label>
            <input className="input" placeholder="Nhập tên hoạt động" value={form.name} onChange={set('name')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Loại hoạt động <span className="text-red-500">*</span></label>
            <select className="select w-full" value={form.type} onChange={set('type')}>
              <option value="">Chọn loại</option>
              <option>Tình nguyện</option>
              <option>Học thuật</option>
              <option>Văn hóa – Văn nghệ</option>
              <option>Kỹ năng & Ngoại khóa</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Đơn vị tổ chức <span className="text-red-500">*</span></label>
            <input className="input" placeholder="Tên tổ chức / đơn vị" value={form.unit} onChange={set('unit')} />
            {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày bắt đầu <span className="text-red-500">*</span></label>
            <input type="date" className="input" value={form.startDate} onChange={set('startDate')} />
            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày kết thúc</label>
            <input type="date" className="input" value={form.endDate} onChange={set('endDate')} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Địa điểm</label>
            <input className="input" placeholder="Địa điểm tổ chức" value={form.location} onChange={set('location')} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nội dung hoạt động</label>
            <textarea className="input min-h-[80px] resize-none" placeholder="Mô tả nội dung đã tham gia..." value={form.content} onChange={set('content')} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả thêm</label>
            <textarea className="input min-h-[60px] resize-none" placeholder="Thông tin bổ sung..." value={form.description} onChange={set('description')} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Minh chứng</label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
              <div className="text-slate-400 text-sm mb-2">📎 Kéo thả file hoặc click để chọn</div>
              <div className="text-slate-400 text-xs">Chấp nhận: PDF, JPG, PNG · Tối đa 10MB mỗi file</div>
              <input type="file" className="hidden" id="fileUpload" multiple onChange={e => {
                const names = Array.from(e.target.files ?? []).map(f => f.name)
                setFiles(prev => [...prev, ...names])
              }} />
              <label htmlFor="fileUpload" className="btn-secondary mt-3 cursor-pointer inline-flex">Chọn file</label>
            </div>
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg text-sm">
                    📄 <span className="text-slate-700">{f}</span>
                    <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="ml-auto text-slate-400 hover:text-red-500">&times;</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2 justify-end border-t border-slate-100">
          <button onClick={() => navigate(-1)} className="btn-secondary">Hủy</button>
          <button onClick={() => handleSubmit(true)} className="btn-secondary">Lưu nháp</button>
          <button onClick={() => handleSubmit(false)} className="btn-primary">Gửi khai báo</button>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
