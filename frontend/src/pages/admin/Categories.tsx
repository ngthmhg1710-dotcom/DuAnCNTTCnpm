import { useEffect, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { deleteCategory, getCategories, saveCategory, type Category, type CategoryType } from '../../lib/api'

const TABS: { type: CategoryType; label: string; usedIn: string }[] = [
  { type: 'ACTIVITY', label: 'Loại hoạt động', usedIn: 'hoạt động' },
  { type: 'UNIT', label: 'Đơn vị tổ chức', usedIn: 'hoạt động' },
  { type: 'CRITERIA_GROUP', label: 'Nhóm tiêu chí', usedIn: 'tiêu chí' },
  { type: 'CLASS', label: 'Lớp', usedIn: 'sinh viên' },
  { type: 'COHORT', label: 'Khóa', usedIn: 'sinh viên' },
]

export default function AdminCategories() {
  const [active, setActive] = useState(TABS[0])
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<{ id?: number; name: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const load = () => {
    setLoading(true)
    getCategories(active.type)
      .then(setItems)
      .catch(() => setToast('Không tải được danh mục.'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [active])

  const isAudience = active.type === 'CLASS' || active.type === 'COHORT' // chỉ chặn xóa khi còn hoạt động nhắm tới (backend kiểm tra)
  const message = (e: any, fallback: string) => e?.response?.data?.message?.toString() || fallback

  const save = async () => {
    if (!form?.name.trim()) return setToast('Vui lòng nhập tên danh mục.')
    setSaving(true)
    try {
      await saveCategory({ id: form.id, type: active.type, name: form.name.trim() })
      setToast(form.id ? 'Đã đổi tên danh mục!' : 'Đã thêm danh mục!')
      setForm(null)
      load()
    } catch (e) {
      setToast(message(e, 'Lưu thất bại.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (c: Category) => {
    if (!confirm(`Xóa danh mục "${c.name}"?`)) return
    try {
      await deleteCategory(c.id)
      setToast('Đã xóa danh mục!')
      load()
    } catch (e) {
      setToast(message(e, 'Xóa thất bại.'))
    }
  }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý danh mục</h1>
          <p className="text-slate-500 text-sm mt-1">
            Đổi tên danh mục sẽ cập nhật luôn các {active.usedIn} đang dùng tên cũ.
            {(active.type === 'CLASS' || active.type === 'COHORT') && ' Danh sách này dùng để chọn "đối tượng tham gia" khi tạo hoạt động.'}
          </p>
        </div>
        <button onClick={() => setForm({ name: '' })} className="btn-primary self-start sm:self-auto">+ Thêm {active.label.toLowerCase()}</button>
      </div>

      <div className="portal-segmented-tabs flex gap-1 mb-5 p-1 w-fit max-w-full overflow-x-auto">
        {TABS.map(t => (
          <button key={t.type} onClick={() => setActive(t)}
            className={`shrink-0 px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${active.type === t.type ? 'active' : ''}`}>{t.label}</button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px] text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">Tên danh mục</th>
              <th className="text-left px-4 py-3">Đang dùng</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && <tr><td colSpan={3} className="text-center py-10 text-slate-400">Đang tải...</td></tr>}
            {!loading && items.map(c => (
              <tr key={c.id} className="table-row">
                <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.usage} {active.usedIn}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => setForm({ id: c.id, name: c.name })} className="btn-secondary text-xs py-1 px-2">Sửa</button>
                    <button onClick={() => remove(c)} disabled={c.usage > 0 && !isAudience} title={c.usage > 0 && !isAudience ? 'Đang được dùng, không xóa được' : undefined}
                      className="btn-secondary text-xs py-1 px-2 text-red-500 disabled:opacity-40 disabled:cursor-not-allowed">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr><td colSpan={3} className="text-center py-10 text-slate-500">Chưa có danh mục</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {form && (
        <Modal title={form.id ? `Đổi tên ${active.label.toLowerCase()}` : `Thêm ${active.label.toLowerCase()}`} onClose={() => setForm(null)}>
          <label htmlFor="cat-name" className="block text-sm font-medium text-slate-700 mb-1.5">Tên danh mục</label>
          <input id="cat-name" className="input mb-4" autoFocus value={form.name} maxLength={100}
            onChange={e => setForm({ ...form, name: e.target.value })} onKeyDown={e => e.key === 'Enter' && save()} />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setForm(null)} className="btn-secondary" disabled={saving}>Hủy</button>
            <button onClick={save} className="btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
