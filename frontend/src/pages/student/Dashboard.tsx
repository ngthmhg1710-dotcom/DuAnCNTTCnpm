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
  CheckCircleOutlined,
  HourglassOutlined,
  UsergroupAddOutlined
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
  const firstName = user?.name ? user.name.split(' ').pop() : 'Hương'

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 pb-1 border-b border-slate-100/80">
        <div>
          <div className="text-[11px] font-bold text-emerald-800 tracking-wider uppercase mb-1">
            HỌC KỲ 1 • 2024–2025
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Chào buổi sáng, {firstName}.
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-normal">
            Một tuần mới với nhiều trải nghiệm đáng chờ đợi. Đây là hành trình của bạn.
          </p>
        </div>

        {/* Date Widget */}
        <div className="self-start sm:self-auto bg-white border border-slate-200/80 shadow-xs rounded-2xl px-5 py-3 text-center min-w-[110px]">
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{dayName}</div>
          <div className="text-2xl font-serif font-extrabold text-slate-900 leading-none my-0.5">{dayNum}</div>
          <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">THÁNG {monthNum}</div>
        </div>
      </div>

      {/* Top Grid: Training Points Progress + Declaration CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Progress Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-wider text-emerald-800 uppercase">
                TIẾN ĐỘ ĐIỂM RÈN LUYỆN
              </span>
              <button
                onClick={() => navigate('/student/criteria')}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              >
                Chi tiết →
              </button>
            </div>

            {/* Score & Rating Title */}
            <div className="flex flex-wrap items-baseline gap-2 mb-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                {pointsPercentage}% hành trình đã hoàn thành
              </h2>
              <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                {currentPoints}/{maxPoints} điểm (Loại Giỏi)
              </span>
            </div>

            {/* Main Progress Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden my-3">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${pointsPercentage}%` }}
              />
            </div>

            {/* Detailed Point Requirement */}
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-5 leading-relaxed">
              💡 <strong>Điểm rèn luyện hiện tại:</strong> <span className="font-bold text-emerald-700">{currentPoints} điểm</span>.
              Đã vượt chỉ tiêu <span className="font-semibold text-slate-800">Loại Giỏi ({targetPointsGood}đ)</span>.
              Cần tích lũy thêm <span className="font-bold text-amber-700">{pointsNeededForExcellent} điểm</span> (tương đương ~1 hoạt động) để đạt <span className="font-bold text-emerald-800">Loại Xuất sắc ({targetPointsExcellent}đ)</span>.
            </div>
          </div>

          {/* 4 Category Sub-boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm shrink-0">
                <TeamOutlined />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500 font-medium truncate">Tình nguyện</div>
                <div className="text-sm font-bold text-slate-800">2 / 2</div>
                <div className="text-[10px] text-emerald-600 font-medium">Hoàn thành</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm shrink-0">
                <TrophyOutlined />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500 font-medium truncate">Học thuật</div>
                <div className="text-sm font-bold text-slate-800">2 / 3</div>
                <div className="text-[10px] text-amber-600 font-medium">Còn 1 hoạt động</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shrink-0">
                <ReadOutlined />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500 font-medium truncate">Văn hóa</div>
                <div className="text-sm font-bold text-slate-800">1 / 1</div>
                <div className="text-[10px] text-emerald-600 font-medium">Hoàn thành</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm shrink-0">
                <RocketOutlined />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500 font-medium truncate">Kỹ năng</div>
                <div className="text-sm font-bold text-slate-800">0 / 1</div>
                <div className="text-[10px] text-slate-400 font-medium">Chưa bắt đầu</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Dark Forest Green Declaration CTA */}
        <div className="bg-[#183628] text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#94d27a]/20 border border-[#94d27a]/30 text-[#94d27a] flex items-center justify-center text-xl">
              <FileTextOutlined />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#94d27a] tracking-wider uppercase mb-1">
                HOẠT ĐỘNG NGOÀI KHOA?
              </div>
              <h3 className="text-2xl font-serif font-bold text-white leading-tight">
                Ghi nhận trải nghiệm của bạn
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Gửi minh chứng để hoạt động được xác nhận vào hồ sơ rèn luyện cá nhân.
              </p>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={() => navigate('/student/declarations/create')}
              className="w-full bg-[#94d27a] hover:bg-[#83c668] text-slate-950 font-bold text-xs py-3 px-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 group-hover:translate-y-[-1px]"
            >
              Khai báo ngay →
            </button>
          </div>

          {/* Abstract background decorative shapes */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#94d27a]/10 blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Middle Section: Khám phá - Hoạt động đang diễn ra & Sắp diễn ra */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold text-amber-700 tracking-wider uppercase mb-0.5">
              KHÁM PHÁ
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              Hoạt động đang & sắp diễn ra
            </h2>
          </div>

          {/* Search bar & Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab('ongoing')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'ongoing' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                ⚡ Đang diễn ra
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'upcoming' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                📅 Sắp diễn ra
              </button>
            </div>

            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Tìm hoạt động..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500 w-36 sm:w-48 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Activity Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredActivities.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-8 text-center text-slate-400 text-sm border border-slate-100">
              Không tìm thấy hoạt động nào phù hợp.
            </div>
          ) : (
            filteredActivities.slice(0, 3).map((act, index) => {
              const startDate = new Date(act.startAt)
              const dateDay = startDate.getDate()
              const dateMonth = startDate.getMonth() + 1
              const defaultImgs = [
                'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80'
              ]
              const bgImg = act.imageUrl || defaultImgs[index % defaultImgs.length]
              const isOngoing = act.status === 'Đang mở' || act.status === 'Đang diễn ra'

              return (
                <div
                  key={act.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Top Image Box */}
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img
                        src={bgImg}
                        alt={act.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                      {/* Category Pill Top-Left */}
                      <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                        <span className="bg-white/90 backdrop-blur-md text-slate-900 font-bold text-[11px] px-3 py-1 rounded-full shadow-xs">
                          {act.category || 'Học thuật'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOngoing ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
                          {isOngoing ? 'Đang diễn ra' : 'Sắp diễn ra'}
                        </span>
                      </div>

                      {/* Date Badge Top-Right */}
                      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white rounded-xl px-2.5 py-1 text-center min-w-[44px]">
                        <div className="text-sm font-bold font-serif leading-tight">{dateDay}</div>
                        <div className="text-[9px] font-bold text-slate-300 uppercase">THG {dateMonth}</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-serif font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
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
        {/* Left Column: Lịch của bạn */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold text-emerald-800 tracking-wider uppercase mb-0.5">
                  LỊCH CỦA BẠN
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900">
                  Sắp tới
                </h3>
              </div>
              <button
                onClick={() => navigate('/student/registered')}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Xem lịch →
              </button>
            </div>

            {/* Event items list */}
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 text-center shrink-0">
                    <div className="text-base font-serif font-bold leading-none">18</div>
                    <div className="text-[9px] font-bold text-slate-400">T12</div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-900 truncate">Workshop: AI Agents — Từ ý tưởng đến sản phẩm</div>
                    <div className="text-xs text-slate-500 mt-0.5">08:00 • Phòng C004</div>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-200">
                  Đã đăng ký
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 text-center shrink-0">
                    <div className="text-base font-serif font-bold leading-none">22</div>
                    <div className="text-[9px] font-bold text-slate-400">T12</div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-900 truncate">IT Student Connect 2024</div>
                    <div className="text-xs text-slate-500 mt-0.5">13:30 • Hội trường 6B</div>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-200">
                  Chờ xác nhận
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dark Forest Green Notification Box */}
        <div className="bg-[#183628] text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg border border-amber-400/30">
              <BellOutlined />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-300 tracking-wider uppercase mb-1">
                THÔNG BÁO MỚI
              </div>
              <h3 className="text-xl font-serif font-bold text-white leading-snug">
                Khai báo của bạn đã được xác minh
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Hoạt động "Tham gia CLB Robotics TDTU" đã được cán bộ ghi nhận thành công vào hồ sơ rèn luyện.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => navigate('/student/notifications')}
              className="text-[#94d27a] hover:text-[#a8e090] text-xs font-bold transition-colors flex items-center gap-1"
            >
              Xem tất cả thông báo →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

