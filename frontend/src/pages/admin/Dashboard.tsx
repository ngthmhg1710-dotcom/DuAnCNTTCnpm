import {
  UsergroupAddOutlined,
  SolutionOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  UnorderedListOutlined
} from '@ant-design/icons'

const stats = [
  { label: 'Tổng tài khoản', value: '1,312', icon: <UsergroupAddOutlined />, color: 'bg-blue-50 text-blue-600' },
  { label: 'Sinh viên', value: '1,247', icon: <SolutionOutlined />, color: 'bg-indigo-50 text-indigo-600' },
  { label: 'Cán bộ', value: '62', icon: <IdcardOutlined />, color: 'bg-purple-50 text-purple-600' },
  { label: 'Admin', value: '3', icon: <SafetyCertificateOutlined />, color: 'bg-slate-100 text-slate-600' },
  { label: 'Tích hợp API', value: '4', icon: <ApiOutlined />, color: 'bg-teal-50 text-teal-600' },
  { label: 'Sync thành công', value: '2,341', icon: <CheckCircleOutlined />, color: 'bg-green-50 text-green-600' },
  { label: 'Sync lỗi', value: '41', icon: <WarningOutlined />, color: 'bg-amber-50 text-amber-600' },
  { label: 'Audit events', value: '8,921', icon: <UnorderedListOutlined />, color: 'bg-slate-50 text-slate-600' },
]

export default function AdminDashboard() {
  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Tổng quan hệ thống quản lý hoạt động sinh viên TDTU</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center text-lg mb-2`}>{s.icon}</div>
            <div className="text-xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <div className="font-semibold text-slate-700 text-sm mb-4">Tăng trưởng tài khoản</div>
          <div className="space-y-2">
            {[['T6/2024', 45], ['T7/2024', 32], ['T8/2024', 18], ['T9/2024', 156], ['T10/2024', 89]].map(([m, v]) => (
              <div key={m as string}>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">{m}</span><span className="font-semibold">{v} tài khoản</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${(v as number / 156) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="font-semibold text-slate-700 text-sm mb-4">Trạng thái tích hợp API</div>
          <div className="space-y-3">
            {[['Phòng CTSV', 'Kết nối', '#22c55e'], ['Hệ thống QLSV', 'Kết nối', '#22c55e'], ['Hệ thống Hoạt động', 'Lỗi', '#ef4444'], ['Mock API', 'Kết nối', '#22c55e']].map(([n, s, c]) => (
              <div key={n as string} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c as string }} />
                <span className="text-slate-700 text-sm flex-1">{n}</span>
                <span className={`text-xs font-semibold`} style={{ color: c as string }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="font-semibold text-slate-700 text-sm mb-4">Hoạt động hệ thống gần đây</div>
        <div className="divide-y divide-slate-50">
          {[
            ['18/08 09:32', 'admin.it', 'Cập nhật tài khoản 521H0003'],
            ['18/08 09:15', 'staff.thu', 'Xác minh khai báo KB-2024-001'],
            ['18/08 08:00', 'system', 'Đồng bộ dữ liệu Phòng CTSV: 1241/1247 thành công'],
            ['17/08 22:15', 'system', 'Đồng bộ Hệ thống HĐ: LỖI – 35 records thất bại'],
          ].map(([t, u, n]) => (
            <div key={t as string} className="py-3 flex gap-4 text-sm items-center">
              <span className="text-xs text-slate-400 font-mono w-20 shrink-0">{t}</span>
              <span className="font-medium text-blue-600 w-24 shrink-0">{u}</span>
              <span className="text-slate-600">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
