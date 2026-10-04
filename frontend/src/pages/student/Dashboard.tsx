import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  FileTextOutlined,
  BellOutlined,
  TrophyOutlined,
  TeamOutlined,
  ReadOutlined,
  RocketOutlined,
  UsergroupAddOutlined,
  BulbOutlined
} from '@ant-design/icons'
import { getCurrentUser, getActivities, Activity, CurrentUser } from '../../lib/api'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'upcoming'>('all')

  useEffect(() => {
    getCurrentUser().then(u => setUser(u)).catch(() => {})
    getActivities().then(list => setActivities(list || [])).catch(() => {})
  }, [])

  // User first name extraction
  const getFirstName = (fullName?: string) => {
    if (!fullName) return ''
    const parts = fullName.trim().split(/\s+/)
    return parts[parts.length - 1]
  }

  const firstName = getFirstName(user?.name)

  // Current Date formatting
  const now = new Date()
  const daysOfWeek = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY']
  const dayName = daysOfWeek[now.getDay()]
  const dayNum = now.getDate()
  const monthNum = now.getMonth() + 1

  // Filter activities for Ongoing vs Upcoming
  const filteredActivities = activities.filter(a => {
    const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || (a.category && a.category.toLowerCase().includes(search.toLowerCase()))
    const isOngoing = a.status === 'Đang mở' || a.status === 'Đang diễn ra'
    if (activeTab === 'ongoing') return matchesSearch && isOngoing
    if (activeTab === 'upcoming') return matchesSearch && !isOngoing
    return matchesSearch
  })

  // Training points summary calculations
  const currentPoints = 85
  const maxPoints = 100
  const targetPointsGood = 80 // Giỏi
  const targetPointsExcellent = 90 // Xuất sắc
  const pointsPercentage = Math.round((currentPoints / maxPoints) * 100)
  const pointsNeededForExcellent = targetPointsExcellent - currentPoints

  return (
    <div className="page-container max-w-6xl space-y-8 py-2">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 pb-1 border-b border-blue-100/80">
        <div>
          <div className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block "></span>
            Học kỳ 1, 2026–2027
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Chào buổi sáng, {firstName}.
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-normal">
            Tổng quan hoạt động và điểm rèn luyện của bạn.
          </p>
        </div>

        {/* Date Widget (Soft Pastel Blue Card) */}
        <div className="self-start sm:self-auto bg-blue-50 text-slate-900 border border-blue-200/80 rounded-lg px-5 py-3 text-center min-w-[115px]">
          <div className="text-xs font-bold text-blue-600">{dayName}</div>
          <div className="text-2xl font-bold text-blue-900 leading-none my-0.5">{dayNum}</div>
          <div className="text-xs font-bold text-slate-500">Tháng {monthNum}</div>
        </div>
      </div>

      {/* Top Grid: Training Points Progress + Declaration CTA (Pastel Panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Progress Card (Pastel Blue Tint) */}
        <div className="lg:col-span-2 bg-blue-50 rounded-lg p-6 border border-blue-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-700">
                Tiến độ điểm rèn luyện
              </span>
              <button
                onClick={() => navigate('/student/criteria')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors"
              >
                Chi tiết →
              </button>
            </div>

            {/* Score & Rating Title */}
            <div className="flex flex-wrap items-baseline gap-2 mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Điểm rèn luyện: {currentPoints}/{maxPoints}
              </h2>
              <span className="text-sm font-bold text-blue-800 bg-blue-100/80 px-3 py-0.5 rounded-full border border-blue-200">
                {currentPoints}/{maxPoints} điểm (Loại Giỏi)
              </span>
            </div>

            {/* Main Progress Bar (Pastel Blue Fill) */}
            <div className="w-full bg-blue-100 h-3.5 rounded-full overflow-hidden my-3 p-0.5 border border-blue-200">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-700 "
                style={{ width: `${pointsPercentage}%` }}
              />
            </div>

            {/* Detailed Point Requirement */}
            <div className="text-xs text-slate-700 bg-white p-3.5 rounded-lg border border-blue-100 mb-5 leading-relaxed ">
              <BulbOutlined className="text-amber-500 mr-1.5 text-sm" /> <strong>Điểm rèn luyện hiện tại:</strong> <span className="font-bold text-blue-700">{currentPoints} điểm</span>.
              Đã vượt chỉ tiêu <span className="font-semibold text-slate-900">Loại Giỏi ({targetPointsGood}đ)</span>.
              Cần tích lũy thêm <span className="font-bold text-blue-800">{pointsNeededForExcellent} điểm</span> (tương đương ~1 hoạt động) để đạt <span className="font-bold text-blue-900">Loại Xuất sắc ({targetPointsExcellent}đ)</span>.
            </div>
          </div>

          {/* 4 Category Sub-boxes (Soft Pastel Color Accents) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-blue-100/80">
            {/* Tình nguyện - Pastel Sky */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors ">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-sm shrink-0 border border-slate-200">
                <TeamOutlined />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-800 font-medium truncate">Tình nguyện</div>
                <div className="text-sm font-bold text-slate-900">2 / 2</div>
                <div className="text-xs text-slate-700 font-bold">Hoàn thành</div>
              </div>
            </div>

            {/* Học thuật - Pastel Indigo */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors ">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm shrink-0 border border-blue-200">
                <TrophyOutlined />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-blue-800 font-medium truncate">Học thuật</div>
                <div className="text-sm font-bold text-slate-900">2 / 3</div>
                <div className="text-xs text-blue-700 font-bold">Còn 1 hoạt động</div>
              </div>
            </div>

            {/* Văn hóa - Pastel Rose */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors ">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-sm shrink-0 border border-slate-200">
                <ReadOutlined />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-800 font-medium truncate">Văn hóa</div>
                <div className="text-sm font-bold text-slate-900">1 / 1</div>
                <div className="text-xs text-slate-700 font-bold">Hoàn thành</div>
              </div>
            </div>

            {/* Kỹ năng - Pastel Purple */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors ">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm shrink-0 border border-purple-200">
                <RocketOutlined />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-purple-800 font-medium truncate">Kỹ năng</div>
                <div className="text-sm font-bold text-slate-900">0 / 1</div>
                <div className="text-xs text-slate-400 font-medium">Chưa bắt đầu</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Soft Pastel Blue-Lavender CTA Panel */}
        <div className="bg-blue-100 border border-blue-200/80 text-slate-900 rounded-lg p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-lg bg-blue-600/10 border border-blue-300 text-blue-700 flex items-center justify-center text-xl ">
              <FileTextOutlined />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-700 mb-1">
                HOẠT ĐỘNG NGOÀI KHOA?
              </div>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                Khai báo hoạt động
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Gửi minh chứng để hoạt động được xác nhận vào hồ sơ rèn luyện cá nhân.
              </p>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={() => navigate('/student/declarations/create')}
              className="w-full bg-blue-600 hover:bg-blue-700 !text-white font-bold text-xs py-3 px-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 group-hover:translate-y-[-1px]"
            >
              Khai báo ngay →
            </button>
          </div>

          {/* Subtle Background shapes */}
        </div>
      </div>

      {/* Middle Section: Khám phá - Hoạt động đang diễn ra & Sắp diễn ra */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-blue-700 mb-0.5">
              KHÁM PHÁ
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Hoạt động đang & sắp diễn ra
            </h2>
          </div>

          {/* Search bar & Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 border border-slate-200/80 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'all' ? 'bg-blue-600 !text-white ' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab('ongoing')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'ongoing' ? 'bg-blue-600 !text-white ' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Đang diễn ra
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'upcoming' ? 'bg-blue-600 !text-white ' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Sắp diễn ra
              </button>
            </div>

            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Tìm hoạt động..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-blue-100 rounded-lg focus-visible:outline-2 focus-visible:outline-blue-600 focus:border-blue-600 w-36 sm:w-48 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Activity Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredActivities.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg p-8 text-center text-slate-400 text-sm border border-blue-100">
              Không tìm thấy hoạt động nào phù hợp.
            </div>
          ) : (
            filteredActivities.slice(0, 3).map((act, index) => {
              const startDate = new Date(act.startAt)
              const dateDay = startDate.getDate()
              const dateMonth = startDate.getMonth() + 1
              const bgImg = act.imageUrl
              const isOngoing = act.status === 'Đang mở' || act.status === 'Đang diễn ra'

              return (
                <div
                  key={act.id}
                  className="bg-white rounded-lg overflow-hidden border border-blue-100/80 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Top Image Box */}
                    <div className="relative h-44 overflow-hidden bg-blue-600">
                      {bgImg && (
                        <>
                          <img
                            src={bgImg}
                            alt={act.title}
                            className="w-full h-full object-cover group-transition-transform duration-500 opacity-95"
                          />
                          <div className="absolute inset-0 bg-slate-950" />
                        </>
                      )}

                      {/* Category Pill Top-Left */}
                      <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                        <span className="bg-white/95 text-slate-900 font-bold text-xs px-3 py-1 rounded-full ">
                          {act.category || 'Học thuật'}
                        </span>
                        <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full ">
                          {isOngoing ? 'Đang diễn ra' : 'Sắp diễn ra'}
                        </span>
                      </div>

                      {/* Date Badge Top-Right */}
                      <div className="absolute top-3 right-3 bg-slate-900 text-white rounded-lg px-2.5 py-1 text-center min-w-[44px] border border-slate-700/50">
                        <div className="text-sm font-bold leading-tight">{dateDay}</div>
                        <div className="text-xs font-bold text-blue-400">THG {dateMonth}</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {act.title}
                      </h3>

                      <div className="space-y-1.5 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <ClockCircleOutlined className="text-slate-400" />
                          <span>{startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {act.endAt ? new Date(act.endAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '17:00'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <EnvironmentOutlined className="text-slate-400" />
                          <span className="truncate">{act.location || 'Hội trường TDTU'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <UsergroupAddOutlined className="text-slate-400" />
                      {act.registered}/{act.capacity || 100} tham gia
                    </span>
                    <button
                      onClick={() => navigate(`/student/activities/${act.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-bold transition-colors"
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Bottom Section: Lịch của bạn (Left) & Notification Box (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left Column: Lịch của bạn (Soft Pastel Blue Card) */}
        <div className="lg:col-span-2 bg-slate-50 rounded-lg p-6 border border-blue-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-bold text-blue-700 mb-0.5">
                  LỊCH CỦA BẠN
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Sắp tới
                </h3>
              </div>
              <button
                onClick={() => navigate('/student/registered')}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                Xem lịch →
              </button>
            </div>

            {/* Event items list */}
            <div className="space-y-3 mt-4">
              <div className="text-center py-6 text-slate-400 text-xs bg-white rounded-lg border border-blue-100">
                Không có sự kiện sắp tới.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Soft Pastel Lavender Notification Panel */}
        <div className="bg-blue-100 border border-blue-200/80 text-slate-900 rounded-lg p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <div className="w-11 h-11 rounded-lg bg-blue-600/10 text-blue-700 flex items-center justify-center text-lg border border-blue-300 ">
              <BellOutlined />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-700 mb-1">
                THÔNG BÁO MỚI
              </div>
              <h3 className="text-xl font-bold text-slate-900 leading-snug">
                Không có thông báo mới
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Tất cả các thông báo mới nhất sẽ xuất hiện tại đây khi được cập nhật.
              </p>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={() => navigate('/student/notifications')}
              className="text-blue-700 hover:text-blue-900 text-xs font-bold transition-colors flex items-center gap-1"
            >
              Xem tất cả thông báo →
            </button>
          </div>

          {/* Background shapes */}
        </div>
      </div>
    </div>
  )
}


