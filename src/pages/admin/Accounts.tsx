import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { accounts } from '../../data/mock'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'

export default function AdminAccounts() {
  const navigate = useNavigate()
  const [lockModal, setLockModal] = useState<number | null>(null)
  const [toast, setToast] = useState('')

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý tài khoản</h1>
        <p className="text-slate-500 text-sm mt-1">{accounts.length} tài khoản trong hệ thống</p>
      </div>

      <div className="card mb-5 p-4 flex gap-3">
        <input className="input max-w-xs" placeholder="Tìm kiếm tài khoản..." />
        <select className="select"><option>Tất cả vai trò</option><option>Sinh viên</option><option>Cán bộ</option><option>Admin</option></select>
        <select className="select"><option>Tất cả trạng thái</option><option>Hoạt động</option><option>Khóa</option></select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
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
            {accounts.map(a => (
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

      {lockModal !== null && (
        <Modal title="Xác nhận khóa tài khoản" onClose={() => setLockModal(null)}>
          <p className="text-slate-600 text-sm mb-4">
            Bạn có chắc chắn muốn khóa tài khoản <strong>{accounts.find(a => a.id === lockModal)?.username}</strong>?
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setLockModal(null)} className="btn-secondary">Hủy</button>
            <button onClick={() => { setLockModal(null); setToast('Đã khóa tài khoản!') }} className="btn-danger">Xác nhận khóa</button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
