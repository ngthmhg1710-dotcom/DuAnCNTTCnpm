import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccounts, getRoles, saveRole, deleteRole } from '../../lib/api'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

interface Role { id: number; name: string; desc: string; status: 'Hoạt động' | 'Tạm khóa' }

const icon = 'w-4 h-4'
const iconBtn = 'w-9 h-9 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-blue-600'
const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']

export default function AdminRoles() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<any[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [editing, setEditing] = useState<Role | null>(null)
  const [toast, setToast] = useState('')
  useEffect(() => {
    getAccounts().then(setAccounts)
    load()
  }, [])
  const load = () => getRoles().then(setRoles).catch(() => setToast('Không tải được vai trò!'))
  const countUsers = (name: string) => accounts.filter(a => a.role === name).length

  const save = async () => {
    if (!editing || !editing.name.trim()) return
    const isNew = editing.id === 0
    try {
      await saveRole({ ...editing, id: isNew ? undefined : editing.id })
      setToast(isNew ? 'Đã thêm vai trò!' : 'Đã cập nhật vai trò!')
      setEditing(null)
      load()
    } catch {
      setToast('Lưu thất bại (tên có thể bị trùng)!')
    }
  }
  const remove = async (r: Role) => {
    if (countUsers(r.name) > 0) return setToast('Không thể xóa vai trò đang có người dùng!')
    if (!confirm(`Xóa vai trò "${r.name}"?`)) return
    await deleteRole(r.id).then(() => { setToast('Đã xóa vai trò!'); load() }).catch(() => setToast('Xóa thất bại!'))
  }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vai trò & Quyền hạn</h1>
          <p className="text-slate-500 text-sm mt-1">Thêm, sửa, xóa vai trò và phân quyền trong hệ thống</p>
        </div>
        <button onClick={() => setEditing({ id: 0, name: '', desc: '', status: 'Hoạt động' })} className="btn-primary self-start sm:self-auto">
          + Thêm vai trò
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">Vai trò</th>
                <th className="text-left px-4 py-3">Mô tả</th>
                <th className="text-center px-4 py-3">Người dùng</th>
                <th className="text-center px-4 py-3">Trạng thái</th>
                <th className="text-right px-4 py-3 w-64">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {roles.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${colors[r.id % colors.length]} rounded-lg flex items-center justify-center text-white font-bold shrink-0`}>{r.name[0]}</div>
                      <span className="font-medium text-slate-800">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs">{r.desc}</td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-700">{countUsers(r.name).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge border ${r.status === 'Hoạt động' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/admin/roles/${r.id}/permissions`)} className="btn-secondary text-xs mr-1">Người dùng</button>
                      <button onClick={() => setEditing(r)} aria-label={`Sửa ${r.name}`} title="Sửa" className={iconBtn}>
                        <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                      </button>
                      <button onClick={() => remove(r)} aria-label={`Xóa ${r.name}`} title="Xóa" className={`${iconBtn} hover:!bg-red-50 hover:text-red-600`}>
                        <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Sửa vai trò' : 'Thêm vai trò'} onClose={() => setEditing(null)}>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên vai trò</label>
            <input autoFocus className="input w-full" placeholder="VD: Giảng viên" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
            <textarea className="input w-full" rows={3} placeholder="Vai trò này được làm gì?" value={editing.desc} onChange={e => setEditing({ ...editing, desc: e.target.value })} />
            <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
            <select className="input w-full" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as Role['status'] })}>
              <option>Hoạt động</option>
              <option>Tạm khóa</option>
            </select>
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => setEditing(null)} className="btn-secondary">Hủy</button>
              <button onClick={save} className="btn-primary">Lưu</button>
            </div>
          </div>
        </Modal>
      )}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
