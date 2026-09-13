import { useNavigate } from 'react-router-dom'
import { students } from '../../data/mock'

const warningStudents = students.filter(s => s.participation === 'Thấp' || s.participation === 'Trung bình').map(s => ({
  ...s,
  missingCriteria: 2,
  warning: s.participation === 'Thấp' ? 'Cao' : 'Trung bình',
  suggestion: 'Đề xuất đăng ký Ngày hội tình nguyện',
}))

export default function StaffAttentionStudents() {
  const navigate = useNavigate()
  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Sinh viên cần quan tâm</h1>
        <p className="text-slate-500 text-sm mt-1">{warningStudents.length} sinh viên có tiến độ hoạt động thấp</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">MSSV</th>
              <th className="text-left px-4 py-3">Họ tên</th>
              <th className="text-left px-4 py-3">Lớp</th>
              <th className="text-left px-4 py-3">Khóa</th>
              <th className="text-left px-4 py-3">Số HĐ</th>
              <th className="text-left px-4 py-3">Tiêu chí thiếu</th>
              <th className="text-left px-4 py-3">Mức cảnh báo</th>
              <th className="text-left px-4 py-3">Đề xuất</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {warningStudents.map(s => (
              <tr key={s.id} className="table-row">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.mssv}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.class}</td>
                <td className="px-4 py-3 text-slate-600">{s.cohort}</td>
                <td className="px-4 py-3 text-slate-600">{s.activities}</td>
                <td className="px-4 py-3 text-slate-600">{s.missingCriteria}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${s.warning === 'Cao' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{s.warning}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{s.suggestion}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/staff/students/${s.id}`)} className="btn-secondary text-xs py-1">Xem chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
