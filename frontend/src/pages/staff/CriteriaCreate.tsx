import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Toast } from '../../components/ui/Toast'
import { getCategories, getCriteria, getSemesters, saveCriteria, type Semester } from '../../lib/api'

export default function StaffCriteriaCreate() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [toast, setToast] = useState('')
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [form, setForm] = useState({ semesterId: 0, group: '', name: '', description: '', requirement: 1, points: 0 })

  useEffect(() => {
    getSemesters().then(list => {
      setSemesters(list)
      setForm(f => (f.semesterId ? f : { ...f, semesterId: (list.find(s => s.isCurrent) ?? list[0])?.id ?? 0 }))
    })
    getCategories('CRITERIA_GROUP').then(list => setCategories(list.map(c => c.name))).catch(() => {})
    if (id) {
      getCriteria().then(list => {
        const c = list.find(x => x.id === Number(id))
        if (c) setForm({ semesterId: c.semesterId, group: c.group, name: c.name, description: c.description ?? '', requirement: c.requirement, points: c.points ?? 0 })
      })
    }
  }, [id])

  const handleSave = async () => {
    if (!form.semesterId) return setToast('Vui lòng tạo học kỳ trước.')
    if (!form.group.trim() || !form.name.trim()) return setToast('Vui lòng nhập nhóm và tên tiêu chí.')
    if (form.requirement < 1) return setToast('Mức yêu cầu phải từ 1 trở lên.')
    if (form.points < 0 || form.points > 100) return setToast('Điểm tối đa phải từ 0 đến 100.')
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
          <label htmlFor="cc-group" className="block text-sm font-medium text-slate-700 mb-1.5">Nhóm tiêu chí</label>
          <select id="cc-group" className="select w-full" value={form.group} onChange={e => setForm({ ...form, group: e.target.value })}>
            <option value="">-- Chọn nhóm --</option>
            {[...new Set([...categories, form.group].filter(Boolean))].map(c => <option key={c}>{c}</option>)}
          </select>
          <p className="text-xs text-slate-400 mt-1">Thêm/đổi tên nhóm ở Admin → Danh mục → Nhóm tiêu chí. Hoạt động có loại trùng tên nhóm sẽ được tính vào tiêu chí.</p>
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
        <div>
          <label htmlFor="cc-points" className="block text-sm font-medium text-slate-700 mb-1.5">Điểm tối đa (cách tính điểm ước tính)</label>
          <input id="cc-points" type="number" min={0} max={100} className="input" value={form.points} onChange={e => setForm({ ...form, points: Number(e.target.value) })} />
          <p className="text-xs text-slate-400 mt-1">Điểm ước tính = tổng điểm/lần của các hoạt động đã tham gia trong nhóm (chọn khi tạo hoạt động), ghi nhận tối đa bằng số này. Quy chế: 20 điểm/mục. Chỉ là điểm tham khảo.</p>
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
