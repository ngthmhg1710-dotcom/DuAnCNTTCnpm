import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAttentionStudents } from '../../lib/api'

type AttentionStudent = {
  id: number
  mssv: string
  name: string
  className: string | null
  cohort: string | null
  activities: number
  missingCriteria: number
  warning: 'Cao' | 'Trung bình'
  suggestion: string
}

export default function StaffAttentionStudents() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<AttentionStudent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAttentionStudents().then(setStudents).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Sinh viên cần quan tâm</h1>
        <p className="text-slate-500 text-sm mt-1">{students.length} sinh viên có tiến độ hoạt động thấp</p>
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
              <th className="text-left px-4 py-3">Nhóm còn thiếu</th>
              <th className="text-left px-4 py-3">Mức cảnh báo</th>
              <th className="text-left px-4 py-3">Đề xuất</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && (
              <tr><td colSpan={9} className="text-center py-10 text-slate-400">Đang tải...</td></tr>
            )}
            {!loading && students.map(s => (
              <tr key={s.id} className="table-row">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.mssv}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.className ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{s.cohort ?? '—'}</td>
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
            {!loading && students.length === 0 && (
              <tr><td colSpan={9} className="text-center py-10 text-slate-400">Không có sinh viên cần quan tâm</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
