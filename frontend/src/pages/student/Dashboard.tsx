import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BellOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  SearchOutlined,
  TeamOutlined,
  TrophyOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { getActivities, getCriteriaProgress, getCurrentUser, type Activity, type CurrentUser } from '../../lib/api'

const DOTS = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-slate-500', 'bg-red-500']
const NEXT_RANK: [number, string][] = [[50, 'Trung bình'], [65, 'Khá'], [80, 'Tốt'], [90, 'Xuất sắc']]

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'open' | 'upcoming'>('all')
  const [now, setNow] = useState<Date | null>(null)
  const [progress, setProgress] = useState<Awaited<ReturnType<typeof getCriteriaProgress>> | null>(null)

  useEffect(() => {
    fetch('https://worldtimeapi.org/api/timezone/Asia/Ho_Chi_Minh')
      .then(r => r.json())
      .then(d => setNow(new Date(d.datetime)))
      .catch(() => setNow(new Date()))
  }, [])

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => {})
    getActivities().then(list => setActivities(list || [])).catch(() => setActivities([]))
    getCriteriaProgress().then(setProgress).catch(() => {})
  }, [])

  const firstName = user?.name?.trim().split(/\s+/).pop() || 'bạn'
  const visibleActivities = activities.filter(activity => {
    const matchesSearch = !search ||
      activity.title.toLowerCase().includes(search.toLowerCase()) ||
      activity.category?.toLowerCase().includes(search.toLowerCase())
    const isOpen = activity.status === 'Đang mở' || activity.status === 'Đang diễn ra'
    if (tab === 'open') return matchesSearch && isOpen
    if (tab === 'upcoming') return matchesSearch && !isOpen
    return matchesSearch
  }).slice(0, 3)

  const categories = (progress?.items ?? []).map((c, i) => [
    c.group,
    `${c.earned ?? 0}/${c.points ?? 0}`,
    `Đã tham gia ${c.current}/${c.required} lần`,
    DOTS[i % DOTS.length],
  ])
  const score = progress?.estimated ?? 0
  const maxTotal = progress?.maxTotal ?? 0
  const pct = maxTotal ? Math.round((score / maxTotal) * 100) : 0
  const next = NEXT_RANK.find(([min]) => score < min && min <= maxTotal)

  return (
    <div className="page-container student-dashboard">
      <header className="dashboard-welcome">
        <div>
          <span className="semester-label">{progress?.semester ?? 'Chưa có học kỳ'}</span>
          <h1>Chào buổi sáng, {firstName}.</h1>
          <p>Theo dõi điểm rèn luyện và các hoạt động sắp tới của bạn.</p>
        </div>
        <div className="dashboard-date">
          <CalendarOutlined />
          <div>
            <span>{(now ?? new Date()).toLocaleDateString('vi-VN', { weekday: 'long' })}</span>
            <strong>{(now ?? new Date()).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
          </div>
        </div>
      </header>

      <section className="score-panel">
        <div className="score-main">
          <div className="score-ring">
            <strong>{progress ? score : '—'}</strong>
            <span>/{maxTotal}</span>
          </div>
          <div>
            <p>Điểm rèn luyện ước tính</p>
            <h2>Dự kiến: {progress?.rank ?? '—'}</h2>
            <span className="verified-label">Điểm tham khảo, không phải điểm chính thức</span>
          </div>
        </div>
        <div className="score-progress">
          <div className="progress-heading">
            <span>Tiến độ hoàn thành</span>
            <strong>{pct}%</strong>
          </div>
          <div className="progress-track"><div style={{ width: `${pct}%` }} /></div>
          <p>
            {next
              ? <>Cần thêm <strong>{next[0] - score} điểm</strong> để đạt loại {next[1]} (từ {next[0]} điểm).</>
              : maxTotal ? 'Bạn đã đạt mức cao nhất có thể theo cấu hình hiện tại.' : 'Học kỳ này chưa cấu hình điểm cho tiêu chí.'}
          </p>
          <p className="text-xs opacity-70 mt-1">Ước tính từ hoạt động đã tham gia trong học kỳ. Điểm chính thức do Khoa/Trường công bố.</p>
        </div>
        <button className="score-detail" onClick={() => navigate('/student/history')}>
          Xem chi tiết <RightOutlined />
        </button>
      </section>

      <section className="category-grid">
        {categories.map(([name, score, state, dot]) => (
          <button
            key={name}
            onClick={() => navigate('/student/criteria')}
            className="category-item"
            aria-label={`Xem chi tiết tiêu chí ${name}`}
          >
            <span className={`category-dot ${dot}`} />
            <span className="category-copy">
              <span>{name}</span>
              <strong>{score}</strong>
              <small>{state}</small>
              <em> Xem chi tiết</em>
            </span>
          </button>
        ))}
      </section>

      <section className="declaration-banner">
        <div className="declaration-icon"><FileTextOutlined /></div>
        <div className="declaration-copy">
          <h2>Hoạt động của bạn chưa có trên hệ thống?</h2>
          <p>Gửi minh chứng để được xác nhận và ghi nhận điểm rèn luyện.</p>
        </div>
        <button onClick={() => navigate('/student/declarations/create')}>
          <FileTextOutlined /> Khai báo hoạt động
        </button>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <span>Khám phá</span>
            <h2>Hoạt động nổi bật</h2>
            <p>Các hoạt động đang mở đăng ký và sắp diễn ra.</p>
          </div>
          <button onClick={() => navigate('/student/activities')}>Xem tất cả <RightOutlined /></button>
        </div>

        <div className="activity-toolbar">
          <div className="activity-tabs" aria-label="Lọc hoạt động">
            {([
              ['all', 'Tất cả'],
              ['open', 'Đang diễn ra'],
              ['upcoming', 'Sắp diễn ra'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                className={tab === value ? 'active' : ''}
                onClick={() => setTab(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="dashboard-search">
            <SearchOutlined />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm hoạt động" />
          </label>
        </div>

        {visibleActivities.length === 0 ? (
          <div className="dashboard-empty">Không tìm thấy hoạt động phù hợp.</div>
        ) : (
          <div className="featured-grid">
            {visibleActivities.map(activity => {
              const date = new Date(activity.startAt)
              return (
                <article key={activity.id} className="featured-card">
                  <button
                    className="featured-card-main"
                    onClick={() => navigate(`/student/activities/${activity.id}`)}
                    aria-label={`Xem chi tiết ${activity.title}`}
                  >
                    <div className="featured-date">
                      <strong>{date.getDate()}</strong>
                      <span>THG {date.getMonth() + 1}</span>
                    </div>
                    <div className="featured-meta">
                      <span>{activity.category || 'Hoạt động sinh viên'}</span>
                      <span className={activity.status === 'Đang mở' ? 'open' : ''}>{activity.status}</span>
                    </div>
                    <h3>{activity.title}</h3>
                    <div className="featured-details">
                      <span><TeamOutlined /> {activity.registered}/{activity.capacity || '—'} người</span>
                      <span><EnvironmentOutlined /> {activity.location || 'Chưa cập nhật'}</span>
                      {activity.points ? <span><TrophyOutlined /> +{activity.points} điểm · {activity.category}</span> : null}
                    </div>
                  </button>
                  <button className="featured-link" onClick={() => navigate(`/student/activities/${activity.id}`)}>
                    Xem chi tiết <RightOutlined />
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <div className="dashboard-bottom">
        <section className="dashboard-panel">
          <div className="section-heading compact">
            <div><h2>Lịch sắp tới</h2></div>
            <button onClick={() => navigate('/student/registered')}>Xem lịch <RightOutlined /></button>
          </div>
          {visibleActivities.length > 0 ? visibleActivities.slice(0, 2).map((activity, index) => {
            const date = new Date(activity.startAt)
            return (
              <button key={activity.id} className="schedule-row" onClick={() => navigate(`/student/activities/${activity.id}`)}>
                <span className="schedule-date"><strong>{date.getDate()}</strong><small>THG {date.getMonth() + 1}</small></span>
                <span className="schedule-copy"><strong>{activity.title}</strong><small>{activity.location || 'Chưa cập nhật'}</small></span>
                <span className="schedule-offset">{index === 0 ? 'Sắp tới' : 'Đang chờ'}</span>
              </button>
            )
          }) : (
            <div className="dashboard-empty compact-empty">Không có sự kiện sắp tới.</div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="section-heading compact">
            <div><h2>Thông báo mới</h2></div>
            <button onClick={() => navigate('/student/notifications')}>Xem tất cả <RightOutlined /></button>
          </div>
          <button className="notice-row" onClick={() => navigate('/student/notifications')}>
            <span className="notice-icon"><BellOutlined /></span>
            <span><strong>Kết quả xác nhận hoạt động tháng 10</strong><small>Phòng Công tác HSSV · 2 giờ trước</small></span>
          </button>
          <button className="notice-row" onClick={() => navigate('/student/notifications')}>
            <span className="notice-icon muted"><BellOutlined /></span>
            <span><strong>Mở đăng ký workshop UI/UX</strong><small>Khoa CNTT · Hôm qua</small></span>
          </button>
        </section>
      </div>
    </div>
  )
}


