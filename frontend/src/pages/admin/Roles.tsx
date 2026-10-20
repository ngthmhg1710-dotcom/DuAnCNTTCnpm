import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccounts, getRoles, saveRole, deleteRole } from '../../lib/api'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

interface Role { id: number; name: string; desc: string; status: 'Hoạt động' | 'Tạm khóa' }

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
                <th className="text-right px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {roles.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                  <td className="px-4 py-3 text-slate-500">{r.desc}</td>
                  <td className="px-4 py-3 text-center">{countUsers(r.name).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge border ${r.status === 'Hoạt động' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                    <button onClick={() => navigate(`/admin/roles/${r.id}/permissions`)} className="text-blue-600 hover:underline">Phân quyền</button>
                    <button onClick={() => setEditing(r)} className="text-blue-600 hover:underline">Sửa</button>
                    <button onClick={() => remove(r)} className="text-red-600 hover:underline">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Sửa vai trò' : 'Thêm vai trò'} onClose={() => setEditing(null)}>
          <div className="space-y-3">
            <input className="input w-full" placeholder="Tên vai trò" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            <textarea className="input w-full" rows={3} placeholder="Mô tả" value={editing.desc} onChange={e => setEditing({ ...editing, desc: e.target.value })} />
            <select className="input w-full" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as Role['status'] })}>
              <option>Hoạt động</option>
              <option>Tạm khóa</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
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
