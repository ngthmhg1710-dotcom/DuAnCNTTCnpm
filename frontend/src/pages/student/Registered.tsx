import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UnorderedListOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
import { statusBadge } from '../../components/ui/Badge'
import { getStudentRegistrations, type RegisteredActivityItem } from '../../lib/api'

export default function StudentRegistered() {
  const navigate = useNavigate()
  const [registered, setRegistered] = useState<RegisteredActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  useEffect(() => {
    setLoading(true)
    getStudentRegistrations()
      .then(data => setRegistered(data || []))
      .catch(() => setRegistered([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = registered.filter(r => !filterStatus || r.status === filterStatus)

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Hoạt động đã đăng ký</h1>
        <p className="text-slate-500 text-sm mt-1">Danh sách các hoạt động bạn đã đăng ký tham gia</p>
      </div>

      <div className="card mb-5 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select className="select w-full sm:w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option>Đã đăng ký</option>
            <option>Đã tham gia</option>
            <option>Vắng</option>
            <option>Đang xác minh</option>
            <option>Đã xác minh</option>
          </select>
          <select className="select w-full sm:w-auto">
            <option>HK1 2026-2027</option>
            <option>HK2 2025-2026</option>
          </select>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'list'
                ? 'bg-blue-600 !text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Chế độ danh sách (Bảng)"
          >
            <UnorderedListOutlined />
            <span>Danh sách</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-blue-600 !text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Chế độ thẻ (Icon)"
          >
            <AppstoreOutlined />
            <span>Dạng thẻ (Icon)</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-slate-400 text-sm">Đang tải...</div>
      ) : viewMode === 'grid' ? (
        /* Grid / Icon Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-full card p-8 text-center text-slate-400 text-sm">
              Chưa có hoạt động nào được đăng ký
            </div>
          ) : (
            filtered.map(r => (
              <div
                key={r.id}
                className="card p-5 flex flex-col justify-between hover:shadow-md transition-all border border-slate-200/80 group bg-white"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <CalendarOutlined className="text-base" />
                    </div>
                    {statusBadge(r.status)}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {r.activity}
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <ClockCircleOutlined className="text-slate-400 shrink-0" />
                      <span className="truncate">Thời gian: <strong className="text-slate-700">{r.time}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnvironmentOutlined className="text-slate-400 shrink-0" />
                      <span className="truncate">Địa điểm: <strong className="text-slate-700">{r.location}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-slate-400 shrink-0" />
                      <span className="truncate">Ngày đăng ký: <strong className="text-slate-700">{r.registeredDate}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`/student/activities/${r.activityId || r.id}`)}
                    className="w-full btn-secondary text-xs py-2 justify-center font-bold text-blue-600 hover:text-blue-800"
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* List / Table View */
        <div className="card overflow-hidden">
          <div className="table-responsive-wrapper">
            <table className="w-full min-w-[650px] text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-4 py-3">Hoạt động</th>
                  <th className="text-left px-4 py-3">Thời gian</th>
                  <th className="text-left px-4 py-3">Địa điểm</th>
                  <th className="text-left px-4 py-3">Ngày đăng ký</th>
                  <th className="text-left px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Chưa có hoạt động nào được đăng ký
                    </td>
                  </tr>
                ) : (
                  filtered.map(r => (
                    <tr key={r.id} className="table-row">
                      <td className="px-4 py-3 font-medium text-slate-800">{r.activity}</td>
                      <td className="px-4 py-3 text-slate-600">{r.time}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{r.location}</td>
                      <td className="px-4 py-3 text-slate-600">{r.registeredDate}</td>
                      <td className="px-4 py-3">{statusBadge(r.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => navigate(`/student/activities/${r.activityId || r.id}`)}
                          className="btn-secondary text-xs py-1"
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
