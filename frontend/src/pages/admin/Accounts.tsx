import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccounts } from '../../lib/api'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

export default function AdminAccounts() {
  const navigate = useNavigate()
  const [accountList, setAccountList] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('Tất cả vai trò')
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái')
  const [lockModal, setLockModal] = useState<number | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    getAccounts().then(data => setAccountList(data))
  }, [])

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
        <select className="select w-full sm:w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
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
              <button className="btn-secondary text-xs flex-1 justify-center py-2">Sửa</button>
              <button onClick={() => setLockModal(a.id)} className="btn-secondary text-xs flex-1 justify-center py-2 text-red-500">Khóa</button>
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
                    <button className="btn-secondary text-xs py-1 px-2">Sửa</button>
                    <button onClick={() => setLockModal(a.id)} className="btn-secondary text-xs py-1 px-2 text-red-500">Khóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {lockModal !== null && (
        <Modal title="Xác nhận khóa tài khoản" onClose={() => setLockModal(null)}>
          <p className="text-slate-600 text-sm mb-4">
            Bạn có chắc chắn muốn khóa tài khoản <strong>{accountList.find(a => a.id === lockModal)?.username}</strong>?
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setLockModal(null)} className="btn-secondary">Hủy</button>
            <button onClick={() => {
              setAccountList(prev => prev.map(acc => acc.id === lockModal ? { ...acc, status: 'Khóa' } : acc))
              setLockModal(null)
              setToast('Đã khóa tài khoản!')
            }} className="btn-danger">Xác nhận khóa</button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
