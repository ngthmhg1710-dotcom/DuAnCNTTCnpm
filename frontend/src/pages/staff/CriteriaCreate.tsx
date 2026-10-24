import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Toast } from '../../components/ui/Toast'
import { getActivities, getCriteria, getSemesters, saveCriteria, type Semester } from '../../lib/api'

export default function StaffCriteriaCreate() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [toast, setToast] = useState('')
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [form, setForm] = useState({ semesterId: 0, group: '', name: '', description: '', requirement: 1 })

  useEffect(() => {
    getSemesters().then(list => {
      setSemesters(list)
      setForm(f => (f.semesterId ? f : { ...f, semesterId: (list.find(s => s.isCurrent) ?? list[0])?.id ?? 0 }))
    })
    getActivities().then(list => setCategories([...new Set(list.map(a => a.category))])).catch(() => {})
    if (id) {
      getCriteria().then(list => {
        const c = list.find(x => x.id === Number(id))
        if (c) setForm({ semesterId: c.semesterId, group: c.group, name: c.name, description: c.description ?? '', requirement: c.requirement })
      })
    }
  }, [id])

  const handleSave = async () => {
    if (!form.semesterId) return setToast('Vui lòng tạo học kỳ trước.')
    if (!form.group.trim() || !form.name.trim()) return setToast('Vui lòng nhập nhóm và tên tiêu chí.')
    if (form.requirement < 1) return setToast('Mức yêu cầu phải từ 1 trở lên.')
    try {
      await saveCriteria({ ...form, id: id ? Number(id) : undefined })
      setToast('Đã lưu tiêu chí!')
      setTimeout(() => navigate('/staff/criteria'), 1000)
    } catch (e: any) {
      setToast(e?.response?.data?.message?.toString() || 'Lưu thất bại.')
    }
  }

  return (
    <div className="page-container max-w-2xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{id ? 'Sửa tiêu chí' : 'Thêm tiêu chí mới'}</h1>
      <div className="card p-6 space-y-4">
        <div>
          <label htmlFor="cc-sem" className="block text-sm font-medium text-slate-700 mb-1.5">Học kỳ</label>
          <select id="cc-sem" className="select w-full" value={form.semesterId} onChange={e => setForm({ ...form, semesterId: Number(e.target.value) })}>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name} {s.year}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="cc-group" className="block text-sm font-medium text-slate-700 mb-1.5">Nhóm tiêu chí (trùng danh mục hoạt động)</label>
          <input id="cc-group" list="cc-groups" className="input" placeholder="Ví dụ: Tình nguyện" value={form.group} onChange={e => setForm({ ...form, group: e.target.value })} />
          <datalist id="cc-groups">{categories.map(c => <option key={c} value={c} />)}</datalist>
        </div>
        <div>
          <label htmlFor="cc-name" className="block text-sm font-medium text-slate-700 mb-1.5">Tên tiêu chí</label>
          <input id="cc-name" className="input" placeholder="Nhập tên tiêu chí" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label htmlFor="cc-desc" className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả</label>
          <textarea id="cc-desc" className="input min-h-[80px] resize-none" placeholder="Mô tả tiêu chí..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label htmlFor="cc-req" className="block text-sm font-medium text-slate-700 mb-1.5">Mức yêu cầu (số hoạt động đã tham gia)</label>
          <input id="cc-req" type="number" min={1} className="input" value={form.requirement} onChange={e => setForm({ ...form, requirement: Number(e.target.value) })} />
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
