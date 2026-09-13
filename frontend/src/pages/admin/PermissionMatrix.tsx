import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Toast } from '../../components/ui/Toast'

const resources = ['Dashboard', 'Sinh viên', 'Hoạt động', 'Tham gia', 'Khai báo', 'Xác minh', 'Tiêu chí', 'Báo cáo', 'API', 'Audit']
const actions = ['Xem', 'Tạo', 'Cập nhật', 'Xóa', 'Duyệt']

const defaultPerms: Record<string, Record<string, boolean>> = Object.fromEntries(
  resources.map(r => [r, Object.fromEntries(actions.map(a => [a, true]))])
)
// Restrict some
defaultPerms['API']['Xóa'] = false
defaultPerms['Audit']['Xóa'] = false
defaultPerms['Audit']['Tạo'] = false

const roleNames = ['', 'Sinh viên', 'Cán bộ', 'Admin']

export default function AdminPermissionMatrix() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [perms, setPerms] = useState(defaultPerms)
  const [toast, setToast] = useState('')

  const toggle = (res: string, act: string) => setPerms(p => ({ ...p, [res]: { ...p[res], [act]: !p[res][act] } }))

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Phân quyền: {roleNames[Number(id) || 3]}</h1>
          <p className="text-slate-500 text-sm mt-1">Cấu hình quyền truy cập theo module</p>
        </div>
        <button onClick={() => setToast('Đã lưu thay đổi quyền hạn!')} className="btn-primary self-start sm:self-auto">Lưu thay đổi</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3 w-40">Module</th>
              {actions.map(a => <th key={a} className="text-center px-4 py-3">{a}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {resources.map(r => (
              <tr key={r} className="table-row">
                <td className="px-4 py-3 font-medium text-slate-700">{r}</td>
                {actions.map(a => (
                  <td key={a} className="px-4 py-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={perms[r][a]} onChange={() => toggle(r, a)} className="sr-only peer" />
                      <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
