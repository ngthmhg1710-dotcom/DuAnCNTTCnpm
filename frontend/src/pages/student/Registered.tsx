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
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'list'
                ? 'bg-blue-600 !text-white shadow-2xs'
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
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-blue-600 !text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Chế độ thẻ"
          >
            <AppstoreOutlined />
            <span>Dạng thẻ</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-slate-400 text-sm">Đang tải...</div>
      ) : viewMode === 'grid' ? (
        /* Grid / Card View with Banner Images */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-full card p-8 text-center text-slate-400 text-sm">
              Chưa có hoạt động nào được đăng ký
            </div>
          ) : (
            filtered.map((r) => {
              return (
                <div
                  key={r.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Top Header: Image or Gradient Banner */}
                    {r.imageUrl ? (
                      <div className="relative h-44 overflow-hidden bg-slate-900">
                        <img
                          src={r.imageUrl}
                          alt={r.activity}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

                        {/* Category Pill Top-Left */}
                        <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                          <span className="bg-white/95 backdrop-blur-md text-slate-900 font-bold text-[11px] px-3 py-1 rounded-full shadow-xs">
                            {r.category || 'Hoạt động SV'}
                          </span>
                        </div>

                        {/* Status Badge Top-Right */}
                        <div className="absolute top-3 right-3 shadow-xs">
                          {statusBadge(r.status)}
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 flex justify-between items-start shrink-0">
                        <span className="bg-white/20 backdrop-blur-md text-white border-0 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {r.category || 'Hoạt động SV'}
                        </span>
                        <div className="shadow-xs">
                          {statusBadge(r.status)}
                        </div>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {r.activity}
                      </h3>

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
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <span className="text-slate-400 font-medium">Học kỳ HK1</span>
                    <button
                      onClick={() => navigate(`/student/activities/${r.activityId || r.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-bold transition-colors flex items-center gap-1"
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                </div>
              )
            })
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
