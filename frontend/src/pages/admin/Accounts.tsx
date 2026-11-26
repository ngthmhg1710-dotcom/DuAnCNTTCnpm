import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccounts, saveAccount, deleteAccount } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

type Account = {
  id: number
  username: string
  name: string
  email: string
  role: string
  status: string
  lastLogin: string
  created: string
}

const ROLE_API_MAP: Record<string, string> = {
  'Admin': 'ADMIN',
  'Cán bộ': 'STAFF',
  'Sinh viên': 'STUDENT',
}

export default function AdminAccounts() {
  const navigate = useNavigate()
  const [accountList, setAccountList] = useState<Account[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('Tất cả vai trò')
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái')
  const [lockModal, setLockModal] = useState<Account | null>(null)
  const [editModal, setEditModal] = useState<Account | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [locking, setLocking] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    getAccounts().then(data => setAccountList(data))
  }, [])

  const openEdit = (a: Account) => {
    setEditForm({ name: a.name, email: a.email, role: a.role, password: '' })
    setEditModal(a)
  }

  const handleSave = async () => {
    if (!editModal) return
    setSaving(true)
    try {
      await saveAccount({
        id: editModal.id,
        name: editForm.name,
        email: editForm.email,
        role: ROLE_API_MAP[editForm.role] ?? editForm.role,
        ...(editForm.password ? { password: editForm.password } : {}),
      })
      setAccountList(prev => prev.map(a =>
        a.id === editModal.id ? { ...a, name: editForm.name, email: editForm.email, role: editForm.role } : a
      ))
      setEditModal(null)
      setToast('Đã cập nhật tài khoản!')
    } catch (err: any) {
      setToast(err?.response?.data?.message || 'Cập nhật thất bại!')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleLock = async () => {
    if (!lockModal) return
    setLocking(true)
    const isLocked = lockModal.status === 'Khóa'
    try {
      await saveAccount({
        id: lockModal.id,
        name: lockModal.name,
        email: lockModal.email,
        status: isLocked ? 'ACTIVE' : 'INACTIVE',
      })
      setAccountList(prev => prev.map(a =>
        a.id === lockModal.id ? { ...a, status: isLocked ? 'Hoạt động' : 'Khóa' } : a
      ))
      setLockModal(null)
      setToast(isLocked ? 'Đã mở khóa tài khoản!' : 'Đã khóa tài khoản!')
    } catch (err: any) {
      setToast(err?.response?.data?.message || 'Thao tác thất bại!')
    } finally {
      setLocking(false)
    }
  }

  const filteredAccounts = accountList.filter(a => {
    const matchSearch =
      a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchRole =
      roleFilter === 'Tất cả vai trò' || a.role === roleFilter

    const matchStatus =
      statusFilter === 'Tất cả trạng thái' || a.status === statusFilter

    return matchSearch && matchRole && matchStatus
  })

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý tài khoản</h1>
        <p className="text-slate-500 text-sm mt-1">{filteredAccounts.length} tài khoản trong hệ thống</p>
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
        <input
          className="input w-full sm:w-auto sm:max-w-xs"
          placeholder="Tìm kiếm tài khoản..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select className="select w-full sm:w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option>Tất cả vai trò</option>
          <option>Sinh viên</option>
          <option>Cán bộ</option>
          <option>Admin</option>
        </select>
        <select className="table-status-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>Tất cả trạng thái</option>
          <option>Hoạt động</option>
          <option>Khóa</option>
        </select>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden space-y-3">
        {filteredAccounts.map(a => (
          <div key={a.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-xs text-slate-500 font-semibold">{a.username}</div>
                <div className="font-semibold text-slate-800 text-sm leading-snug mt-0.5">{a.name}</div>
                <div className="text-xs text-slate-500 mt-0.5 break-all">{a.email}</div>
              </div>
              <div className="shrink-0">{statusBadge(a.status)}</div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <span className={`badge ${a.role === 'Admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : a.role === 'Cán bộ' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>{a.role}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div><span className="text-slate-400">Đăng nhập cuối:</span> <span className="font-medium text-slate-700">{a.lastLogin}</span></div>
              <div><span className="text-slate-400">Ngày tạo:</span> <span className="font-medium text-slate-700">{a.created}</span></div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => navigate(`/admin/accounts/${a.id}`)} className="btn-secondary text-xs flex-1 justify-center py-2">Xem</button>
              <button onClick={() => openEdit(a)} className="btn-secondary text-xs flex-1 justify-center py-2">Sửa</button>
              <button onClick={() => setLockModal(a)} className={`btn-secondary text-xs flex-1 justify-center py-2 ${a.status === 'Khóa' ? 'text-emerald-600' : 'text-red-500'}`}>
                {a.status === 'Khóa' ? 'Mở khóa' : 'Khóa'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-hidden">
        <div className="table-responsive-wrapper">
          <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">Username</th>
              <th className="text-left px-4 py-3">Họ tên</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Vai trò</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-left px-4 py-3">Đăng nhập cuối</th>
              <th className="text-left px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredAccounts.map(a => (
              <tr key={a.id} className="table-row">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{a.username}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{a.name}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{a.email}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${a.role === 'Admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : a.role === 'Cán bộ' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>{a.role}</span>
                </td>
                <td className="px-4 py-3">{statusBadge(a.status)}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{a.lastLogin}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{a.created}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => navigate(`/admin/accounts/${a.id}`)} className="btn-secondary text-xs py-1 px-2">Xem</button>
                    <button onClick={() => openEdit(a)} className="btn-secondary text-xs py-1 px-2">Sửa</button>
                    <button onClick={() => setLockModal(a)} className={`btn-secondary text-xs py-1 px-2 ${a.status === 'Khóa' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {a.status === 'Khóa' ? 'Mở khóa' : 'Khóa'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAccounts.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-slate-500">Chưa có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal Khóa / Mở khóa */}
      {lockModal !== null && (
        <Modal title={lockModal.status === 'Khóa' ? 'Xác nhận mở khóa tài khoản' : 'Xác nhận khóa tài khoản'} onClose={() => setLockModal(null)}>
          <p className="text-slate-600 text-sm mb-4">
            {lockModal.status === 'Khóa'
              ? <>Bạn có chắc muốn <strong>mở khóa</strong> tài khoản <strong>{lockModal.username}</strong>?</>
              : <>Bạn có chắc muốn <strong>khóa</strong> tài khoản <strong>{lockModal.username}</strong>? Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa.</>
            }
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setLockModal(null)} className="btn-secondary" disabled={locking}>Hủy</button>
            <button onClick={handleToggleLock} disabled={locking} className={lockModal.status === 'Khóa' ? 'btn-primary' : 'btn-danger'}>
              {locking ? 'Đang xử lý...' : lockModal.status === 'Khóa' ? 'Mở khóa' : 'Xác nhận khóa'}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Sửa tài khoản */}
      {editModal !== null && (
        <Modal title={`Sửa tài khoản: ${editModal.username}`} onClose={() => setEditModal(null)}>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Họ tên</label>
              <input
                className="input w-full"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                className="input w-full"
                type="email"
                value={editForm.email}
                onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Vai trò</label>
              <select
                className="select w-full"
                value={editForm.role}
                onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
              >
                <option value="Sinh viên">Sinh viên</option>
                <option value="Cán bộ">Cán bộ</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Mật khẩu mới <span className="text-slate-400 font-normal">(để trống nếu không đổi)</span></label>
              <input
                className="input w-full"
                type="password"
                placeholder="••••••••"
                value={editForm.password}
                onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setEditModal(null)} className="btn-secondary" disabled={saving}>Hủy</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
