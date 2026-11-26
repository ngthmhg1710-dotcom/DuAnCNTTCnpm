import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Toast } from '../../components/ui/Toast'
import { createActivity, getActivity, updateActivity } from '../../lib/api'
import { DRL_SECTIONS, DRL_SECTION_MAX, findDrlOption } from '../../data/drl'

// ISO (UTC) -> "YYYY-MM-DDTHH:mm" theo giờ máy, đúng định dạng của <input type="datetime-local">
const toLocalInput = (iso: string) => {
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export default function StaffActivityCreate() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [form, setForm] = useState({ title: '', category: '', ruleCode: '', points: 0, unit: '', location: '', startAt: '', endAt: '', capacity: '', description: '', imageUrl: '' })
  const section = DRL_SECTIONS.find(s => s.name === form.category)
  const rule = findDrlOption(form.ruleCode)

  const pickSection = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setForm(f => ({ ...f, category: e.target.value, ruleCode: '', points: 0 }))
  const pickRule = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = findDrlOption(e.target.value)
    setForm(f => ({ ...f, ruleCode: e.target.value, points: found?.option.variable ? 0 : found?.option.points ?? 0 }))
  }

  useEffect(() => {
    if (!id) return
    getActivity(id).then(a => {
      setForm({
        title: a.title,
        category: a.category,
        ruleCode: a.ruleCode ?? '',
        points: a.points ?? 0,
        unit: a.unit ?? '',
        location: a.location ?? '',
        startAt: toLocalInput(a.startAt),
        endAt: a.endAt ? toLocalInput(a.endAt) : '',
        capacity: a.capacity ? String(a.capacity) : '',
        description: a.description ?? '',
        imageUrl: a.imageUrl ?? '',
      })
    }).finally(() => setLoading(false))
  }, [id])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast('Dung lượng hình ảnh quá lớn (tối đa 5MB).')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setForm(f => ({ ...f, imageUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const [saving, setSaving] = useState(false)

  const parseIso = (val: string) => {
    if (!val) return undefined
    try {
      const d = new Date(val)
      if (!isNaN(d.getTime())) return d.toISOString()
    } catch (e) {}
    return new Date().toISOString()
  }

  const handleSave = async (publish: boolean) => {
    if (!form.title.trim() || !form.category || !form.startAt) {
      setToast('Vui lòng nhập tên hoạt động, mục lớn và ngày bắt đầu.')
      return
    }
    if (form.endAt && new Date(form.endAt) <= new Date(form.startAt)) {
      setToast('Thời gian kết thúc phải sau thời gian bắt đầu.')
      return
    }
    if (!rule) {
      setToast('Vui lòng chọn mục nhỏ trong quy chế để tính điểm rèn luyện.')
      return
    }
    if (!Number.isInteger(form.points) || form.points < 0 || form.points > rule.option.points) {
      setToast(`Điểm phải là số nguyên từ 0 đến ${rule.option.points}.`)
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        ruleCode: form.ruleCode,
        points: form.points,
        unit: form.unit.trim() || undefined,
        location: form.location.trim() || undefined,
        description: form.description.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        startAt: parseIso(form.startAt)!,
        endAt: parseIso(form.endAt),
        capacity: form.capacity ? Number(form.capacity) : undefined,
        published: publish,
      }
      if (isEdit) await updateActivity(id!, payload)
      else await createActivity(payload)
      setToast(publish ? 'Hoạt động đã được công bố và hiển thị cho sinh viên!' : 'Đã lưu nháp hoạt động thành công.')
      setTimeout(() => navigate('/staff/activities'), 600)
    } catch (err: any) {
      setToast('Có lỗi khi lưu hoạt động: ' + (err?.message || 'Thất bại.'))
      setSaving(false)
    }
  }

  if (loading) return <div className="page-container"><div className="card p-8 text-center text-slate-400 text-sm">Đang tải...</div></div>

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{isEdit ? 'Chỉnh sửa hoạt động' : 'Tạo hoạt động mới'}</h1>

      <div className="card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="activitycreate-f1" className="block text-sm font-medium text-slate-700 mb-1.5">Tên hoạt động <span className="text-red-500">*</span></label>
            <input id="activitycreate-f1" className="input" placeholder="Nhập tên hoạt động" value={form.title} onChange={set('title')} />
          </div>
          <div className="col-span-2 rounded-lg border border-blue-100 bg-blue-50/40 p-4 space-y-3">
            <div className="text-sm font-semibold text-slate-700">Điểm rèn luyện theo quy chế</div>
            <div>
              <label htmlFor="activitycreate-f2" className="block text-sm font-medium text-slate-700 mb-1.5">Mục lớn <span className="text-red-500">*</span></label>
              <select id="activitycreate-f2" className="select w-full" value={form.category} onChange={pickSection}>
                <option value="">-- Chọn mục lớn --</option>
                {DRL_SECTIONS.map(s => <option key={s.name} value={s.name}>{s.article}. {s.name} (tối đa {DRL_SECTION_MAX} điểm)</option>)}
                {form.category && !section && <option value={form.category}>{form.category} (loại cũ, không có trong quy chế)</option>}
              </select>
            </div>
            <div>
              <label htmlFor="activitycreate-rule" className="block text-sm font-medium text-slate-700 mb-1.5">Mục nhỏ <span className="text-red-500">*</span></label>
              <select id="activitycreate-rule" className="select w-full" value={form.ruleCode} onChange={pickRule} disabled={!section}>
                <option value="">{section ? '-- Chọn mục nhỏ --' : 'Chọn mục lớn trước'}</option>
                {section?.items.map(item => (
                  <optgroup key={item.label} label={item.label}>
                    {item.options.map(o => (
                      <option key={o.code} value={o.code}>{o.label} — {o.variable ? `tối đa ${o.points}` : o.points} điểm</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            {rule && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label htmlFor="activitycreate-points" className="text-sm font-medium text-slate-700 shrink-0">Điểm mỗi lần tham gia</label>
                <input id="activitycreate-points" type="number" min={0} max={rule.option.points} className="input sm:w-28"
                  value={form.points} readOnly={!rule.option.variable}
                  onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))} />
                <span className="text-xs text-slate-500">
                  {rule.option.variable ? `Quy chế không quy định điểm cố định, nhập từ 0 đến ${rule.option.points}.` : `Theo ${rule.section.article} mục ${rule.option.code}.`}
                </span>
              </div>
            )}
          </div>
          <div className="col-span-2">
            <label htmlFor="activitycreate-f3" className="block text-sm font-medium text-slate-700 mb-1.5">Đơn vị tổ chức</label>
            <input id="activitycreate-f3" className="input" placeholder="Tên đơn vị / CLB" value={form.unit} onChange={set('unit')} />
          </div>

          {/* Image Upload Box */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Hình ảnh minh họa <span className="text-slate-400 font-normal">(Tùy chọn - Tải ảnh từ máy hoặc dán liên kết URL)</span>
            </label>
            {form.imageUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 group max-h-56 bg-slate-100 flex items-center justify-center">
                <img src={form.imageUrl} alt="Minh họa hoạt động" className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors shadow"
                  >
                    🗑️ Xóa ảnh minh họa
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-5 text-center transition-colors bg-slate-50/50 hover:bg-blue-50/30">
                  <input
                    type="file"
                    accept="image/*"
                    id="activity-image-file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="activity-image-file" className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
                    <span className="text-3xl">🖼️</span>
                    <span className="text-sm font-semibold text-blue-600 hover:underline">Nhấn để chọn hình ảnh từ thiết bị</span>
                    <span className="text-xs text-slate-400">Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB)</span>
                  </label>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-full border-t border-slate-200" />
                  <span>hoặc</span>
                  <span className="w-full border-t border-slate-200" />
                </div>
                <input
                  className="input text-xs"
                  placeholder="Dán đường dẫn URL hình ảnh (ví dụ: https://images.unsplash.com/...)"
                  value={form.imageUrl}
                  onChange={set('imageUrl')}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="activitycreate-f4" className="block text-sm font-medium text-slate-700 mb-1.5">Số lượng tối đa</label>
            <input id="activitycreate-f4" type="number" className="input" placeholder="100" value={form.capacity} onChange={set('capacity')} />
          </div>
          <div>
            <label htmlFor="activitycreate-f5" className="block text-sm font-medium text-slate-700 mb-1.5">Địa điểm</label>
            <input id="activitycreate-f5" className="input" placeholder="Địa điểm tổ chức" value={form.location} onChange={set('location')} />
          </div>
          <div>
            <label htmlFor="activitycreate-f6" className="block text-sm font-medium text-slate-700 mb-1.5">Bắt đầu (ngày, giờ) <span className="text-red-500">*</span></label>
            <input id="activitycreate-f6" type="datetime-local" className="input" value={form.startAt} onChange={set('startAt')} />
          </div>
          <div>
            <label htmlFor="activitycreate-f7" className="block text-sm font-medium text-slate-700 mb-1.5">Kết thúc (ngày, giờ)</label>
            <input id="activitycreate-f7" type="datetime-local" className="input" min={form.startAt || undefined} value={form.endAt} onChange={set('endAt')} />
          </div>
          <div className="col-span-2">
            <label htmlFor="activitycreate-f8" className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả hoạt động</label>
            <textarea id="activitycreate-f8" className="input min-h-[100px] resize-none" placeholder="Nội dung, mục tiêu hoạt động..." value={form.description} onChange={set('description')} />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
          <button onClick={() => navigate(-1)} disabled={saving} className="btn-secondary">Hủy</button>
          <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary">
            {saving ? 'Đang lưu...' : 'Lưu nháp'}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary">
            {saving ? 'Đang công bố...' : 'Công bố'}
          </button>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
