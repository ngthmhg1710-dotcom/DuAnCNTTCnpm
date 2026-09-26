import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Toast } from '../../components/ui/Toast'
import { createActivity, getActivity, updateActivity } from '../../lib/api'

export default function StaffActivityCreate() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [form, setForm] = useState({ title: '', category: '', unit: '', location: '', startAt: '', endAt: '', capacity: '', description: '' })

  useEffect(() => {
    if (!id) return
    getActivity(id).then(a => {
      setForm({
        title: a.title,
        category: a.category,
        unit: a.unit ?? '',
        location: a.location ?? '',
        startAt: a.startAt.slice(0, 10),
        endAt: a.endAt ? a.endAt.slice(0, 10) : '',
        capacity: a.capacity ? String(a.capacity) : '',
        description: a.description ?? '',
      })
    }).finally(() => setLoading(false))
  }, [id])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async (publish: boolean) => {
    if (!form.title.trim() || !form.category || !form.startAt) {
      setToast('Vui lòng nhập tên hoạt động, loại hoạt động và ngày bắt đầu.')
      return
    }
    const payload = {
      title: form.title,
      category: form.category,
      unit: form.unit || undefined,
      location: form.location || undefined,
      description: form.description || undefined,
      startAt: new Date(form.startAt).toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      published: publish,
    }
    if (isEdit) await updateActivity(id!, payload)
    else await createActivity(payload)
    setToast(publish ? 'Hoạt động đã được công bố!' : 'Đã lưu nháp hoạt động.')
    setTimeout(() => navigate('/staff/activities'), 1000)
  }

  if (loading) return <div className="page-container"><div className="card p-8 text-center text-slate-400 text-sm">Đang tải...</div></div>

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{isEdit ? 'Chỉnh sửa hoạt động' : 'Tạo hoạt động mới'}</h1>

      <div className="card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên hoạt động <span className="text-red-500">*</span></label>
            <input className="input" placeholder="Nhập tên hoạt động" value={form.title} onChange={set('title')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Loại hoạt động <span className="text-red-500">*</span></label>
            <select className="select w-full" value={form.category} onChange={set('category')}>
              <option value="">Chọn loại</option>
              <option>Tình nguyện</option>
              <option>Học thuật</option>
              <option>Văn hóa - Thể thao</option>
              <option>Kỹ năng & Ngoại khóa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Đơn vị tổ chức</label>
            <input className="input" placeholder="Tên đơn vị / CLB" value={form.unit} onChange={set('unit')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Số lượng tối đa</label>
            <input type="number" className="input" placeholder="100" value={form.capacity} onChange={set('capacity')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Địa điểm</label>
            <input className="input" placeholder="Địa điểm tổ chức" value={form.location} onChange={set('location')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày bắt đầu <span className="text-red-500">*</span></label>
            <input type="date" className="input" value={form.startAt} onChange={set('startAt')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày kết thúc</label>
            <input type="date" className="input" value={form.endAt} onChange={set('endAt')} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả hoạt động</label>
            <textarea className="input min-h-[100px] resize-none" placeholder="Nội dung, mục tiêu hoạt động..." value={form.description} onChange={set('description')} />
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
