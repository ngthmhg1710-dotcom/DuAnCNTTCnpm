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
  { label: 'Tổng tài khoản', value: '0', icon: <UsergroupAddOutlined />, color: 'bg-blue-50 text-blue-600' },
  { label: 'Sinh viên', value: '0', icon: <SolutionOutlined />, color: 'bg-blue-50 text-blue-600' },
  { label: 'Cán bộ', value: '0', icon: <IdcardOutlined />, color: 'bg-purple-50 text-purple-600' },
  { label: 'Admin', value: '0', icon: <SafetyCertificateOutlined />, color: 'bg-slate-100 text-slate-600' },
  { label: 'Tích hợp API', value: '0', icon: <ApiOutlined />, color: 'bg-slate-50 text-slate-600' },
  { label: 'Sync thành công', value: '0', icon: <CheckCircleOutlined />, color: 'bg-green-50 text-green-600' },
  { label: 'Sync lỗi', value: '0', icon: <WarningOutlined />, color: 'bg-amber-50 text-amber-600' },
  { label: 'Audit events', value: '0', icon: <UnorderedListOutlined />, color: 'bg-slate-50 text-slate-600' },
]

export default function AdminDashboard() {
  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Tổng quan hệ thống quản lý hoạt động sinh viên TDTU</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center text-lg mb-2`}>{s.icon}</div>
            <div className="text-lg sm:text-xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="font-semibold text-slate-700 text-sm mb-4">Hoạt động hệ thống gần đây</div>
        <div className="text-center py-6 text-slate-400 text-xs">Không có hoạt động nào</div>
      </div>
    </div>
  )
}
