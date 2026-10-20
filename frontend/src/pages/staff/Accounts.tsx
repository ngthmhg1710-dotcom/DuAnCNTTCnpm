import { useState, useEffect } from 'react'
import { getAccounts, saveAccount, deleteAccount } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

const empty = { id: 0, username: '', name: '', email: '', status: 'ACTIVE' }
const lab = 'block text-sm font-medium text-slate-700 mb-1'

export default function StaffAccounts() {
  const [list, setList] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<typeof empty | null>(null)
  const [toast, setToast] = useState('')

  const load = () => getAccounts().then(d => setList(d.filter((a: any) => a.role === 'Sinh viên')))
  useEffect(() => { load() }, [])

  const rows = list.filter(a => `${a.username} ${a.name} ${a.email}`.toLowerCase().includes(search.toLowerCase()))
  const err = (e: any) => setToast(e?.response?.data?.message || 'Thao tác thất bại!')

  const save = async () => {
    if (!editing) return
    try {
      await saveAccount({ ...editing, id: editing.id || undefined })
      setToast(editing.id ? 'Đã cập nhật tài khoản!' : 'Đã cấp tài khoản!')
      setEditing(null)
      load()
    } catch (e) { err(e) }
  }
  const remove = async (a: any) => {
    if (!confirm(`Xóa tài khoản ${a.username}?`)) return
    try { await deleteAccount(a.id); setToast('Đã xóa tài khoản!'); load() } catch (e) { err(e) }
  }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tài khoản sinh viên</h1>
          <p className="text-slate-500 text-sm mt-1">Cấp mail, thêm, sửa, xóa tài khoản sinh viên</p>
        </div>
        <button onClick={() => setEditing(empty)} className="btn-primary self-start sm:self-auto">+ Thêm tài khoản</button>
      </div>

      <div className="card mb-5 p-4">
        <input className="input w-full sm:max-w-xs" placeholder="Tìm theo MSSV, tên, email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">MSSV</th>
                <th className="text-left px-4 py-3">Họ tên</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
                <th className="text-right px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map(a => (
                <tr key={a.id} className="table-row">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{a.username}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{a.name}</td>
                  <td className="px-4 py-3 text-slate-600">{a.email}</td>
                  <td className="px-4 py-3">{statusBadge(a.status)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                    <button onClick={() => setEditing({ ...a, status: a.status === 'Khóa' ? 'INACTIVE' : 'ACTIVE' })} className="text-blue-600 hover:underline">Sửa</button>
                    <button onClick={() => remove(a)} className="text-red-600 hover:underline">Xóa</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-slate-500">Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Sửa tài khoản' : 'Thêm tài khoản'} onClose={() => setEditing(null)}>
          <div className="space-y-1.5">
            <label className={lab}>MSSV (username)</label>
            <input autoFocus disabled={!!editing.id} className="input w-full" value={editing.username} onChange={e => setEditing({ ...editing, username: e.target.value })} />
            <label className={lab}>Họ tên</label>
            <input className="input w-full" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            <label className={lab}>Email</label>
            <input type="email" className="input w-full" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} />
            {!!editing.id && (
              <>
                <label className={lab}>Trạng thái</label>
                <select className="input w-full" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Khóa</option>
                </select>
              </>
            )}
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
