import { useNavigate } from 'react-router-dom'

const roles = [
  { id: 1, name: 'Sinh viên', desc: 'Xem và đăng ký hoạt động, khai báo, theo dõi tiêu chí', users: 1247, status: 'Hoạt động', color: 'bg-blue-500' },
  { id: 2, name: 'Cán bộ', desc: 'Quản lý hoạt động, sinh viên, xác minh khai báo, thống kê', users: 62, status: 'Hoạt động', color: 'bg-emerald-500' },
  { id: 3, name: 'Admin', desc: 'Quản trị toàn bộ hệ thống, tài khoản, phân quyền, tích hợp', users: 3, status: 'Hoạt động', color: 'bg-purple-500' },
]

export default function AdminRoles() {
  const navigate = useNavigate()
  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Vai trò & Quyền hạn</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý vai trò và phân quyền trong hệ thống</p>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {roles.map(r => (
          <div key={r.id} className="card p-6">
            <div className={`w-12 h-12 ${r.color} rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-4`}>
              {r.name[0]}
            </div>
            <div className="font-bold text-slate-800 text-lg">{r.name}</div>
            <div className="text-slate-500 text-sm mt-1 leading-relaxed">{r.desc}</div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-800">{r.users.toLocaleString()}</div>
                <div className="text-xs text-slate-500">người dùng</div>
              </div>
              <span className="badge bg-green-50 text-green-700 border border-green-200">{r.status}</span>
            </div>
            <button onClick={() => navigate(`/admin/roles/${r.id}/permissions`)} className="btn-secondary w-full justify-center mt-4 text-xs">
              Quản lý quyền hạn →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
