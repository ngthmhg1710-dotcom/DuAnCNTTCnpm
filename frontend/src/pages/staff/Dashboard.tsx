import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  RightOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { getStaffDashboard } from '../../lib/api'

type DashboardData = {
  students: number
  activities: number
  participations: number
  participationRate: number
  pendingVerification: number
  needsMoreInfo: number
  attentionCount: number
  byCategory: { category: string; value: number }[]
}

export default function StaffDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    getStaffDashboard().then(setData).catch(() => setData(null))
  }, [])

  const participationRate = data?.participationRate ?? 0

  return (
    <div className="page-container student-dashboard">
      <header className="dashboard-welcome">
        <div>
          <span className="semester-label">Cán bộ · Học kỳ 1/2026–2027</span>
          <h1>Chào buổi sáng, Cán bộ.</h1>
          <p>Theo dõi sinh viên, hoạt động và các yêu cầu cần xử lý trong khoa.</p>
        </div>
        <div className="dashboard-date">
          <CalendarOutlined />
          <div>
            <span>Thứ Hai</span>
            <strong>16 tháng 11, 2026</strong>
          </div>
        </div>
      </header>

      <section className="score-panel">
        <div className="score-main">
          <div className="score-ring">
            {data ? (
              <>
                <strong>{participationRate}</strong>
                <span>%</span>
              </>
            ) : (
              <strong>…</strong>
            )}
          </div>
          <div>
            <p>Tỷ lệ tham gia hoạt động</p>
            <h2>{data?.participations ?? '—'} lượt tham gia</h2>
            <span className="verified-label">{data?.pendingVerification ?? '—'} yêu cầu chờ xử lý</span>
          </div>
        </div>
        <div className="score-progress">
          <div className="progress-heading">
            <span>Tiến độ hoạt động của khoa</span>
            <strong>{participationRate}%</strong>
          </div>
          <div className="progress-track"><div style={{ width: `${participationRate}%` }} /></div>
          <p>Cần xử lý <strong>{data?.pendingVerification ?? 0} yêu cầu</strong> xác minh khai báo.</p>
        </div>
        <button className="score-detail" onClick={() => navigate('/staff/analytics')}>
          Xem chi tiết <RightOutlined />
        </button>
      </section>

      <section className="category-grid">
        {[
          ['Sinh viên', data?.students ?? '—', 'Trong khoa', 'bg-blue-500'],
          ['Hoạt động', data?.activities ?? '—', 'Đang tổ chức', 'bg-violet-500'],
          ['Chờ xác minh', data?.pendingVerification ?? '—', 'Cần xử lý', 'bg-amber-500'],
          ['Cần quan tâm', data?.attentionCount ?? '—', 'Theo dõi', 'bg-red-500'],
        ].map(([name, score, state, dot]) => (
          <button
            key={name}
            className="category-item"
            onClick={() => navigate(name === 'Cần quan tâm' ? '/staff/attention-students' : '/staff/students')}
          >
            <span className={`category-dot ${dot}`} />
            <span className="category-copy">
              <span>{name}</span>
              <strong>{score}</strong>
              <small>{state}</small>
            </span>
          </button>
        ))}
      </section>

      <section className="declaration-banner">
        <div className="declaration-icon"><FileTextOutlined /></div>
        <div className="declaration-copy">
          <h2>Có khai báo sinh viên cần xác minh?</h2>
          <p>Xem và xử lý các yêu cầu xác minh, bổ sung minh chứng hoặc từ chối.</p>
        </div>
        <button onClick={() => navigate('/staff/verifications')}>
          <CheckCircleOutlined /> Xử lý xác minh
        </button>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <span>Công việc</span>
            <h2>Danh mục cần xử lý</h2>
            <p>Các nhiệm vụ ưu tiên trong học kỳ hiện tại.</p>
          </div>
          <button onClick={() => navigate('/staff/verifications')}>Xem tất cả <RightOutlined /></button>
        </div>

        <div className="featured-grid">
          {[
            {
              title: 'Khai báo chờ xác minh',
              description: 'Cần tiếp nhận và xử lý',
              count: data?.pendingVerification ?? 0,
              route: '/staff/verifications',
              status: 'Chờ xử lý',
            },
            {
              title: 'Yêu cầu bổ sung',
              description: 'Đang chờ phản hồi sinh viên',
              count: data?.needsMoreInfo ?? 0,
              route: '/staff/verifications',
              status: 'Cần bổ sung',
            },
            {
              title: 'Sinh viên cần quan tâm',
              description: 'Tiến độ hoạt động thấp',
              count: data?.attentionCount ?? 0,
              route: '/staff/attention-students',
              status: 'Theo dõi',
            },
          ].map(item => (
            <article className="featured-card" key={item.title}>
              <button className="featured-card-main" onClick={() => navigate(item.route)}>
                <div className="featured-meta">
                  <span>{item.status}</span>
                  <span className="open">{item.count} yêu cầu</span>
                </div>
                <h3>{item.title}</h3>
                <div className="featured-details">
                  <span><TeamOutlined /> {item.description}</span>
                </div>
              </button>
              <button className="featured-link" onClick={() => navigate(item.route)}>
                Xem chi tiết <RightOutlined />
              </button>
            </article>
          ))}
        </div>
      </section>

      <div className="dashboard-bottom">
        <section className="dashboard-panel">
          <div className="section-heading compact">
            <div><h2>Hoạt động theo loại</h2></div>
            <button onClick={() => navigate('/staff/activities')}>Xem tất cả <RightOutlined /></button>
          </div>
          {(data?.byCategory ?? []).slice(0, 4).map((category, index) => (
            <button key={category.category} className="schedule-row" onClick={() => navigate('/staff/activities')}>
              <span className="schedule-date"><strong>{index + 1}</strong><small>NHÓM</small></span>
              <span className="schedule-copy">
                <strong>{category.category}</strong>
                <small>{category.value} hoạt động</small>
              </span>
              <span className="schedule-offset">Chi tiết</span>
            </button>
          ))}
          {data && data.byCategory.length === 0 && (
            <div className="dashboard-empty compact-empty">Chưa có dữ liệu hoạt động.</div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="section-heading compact">
            <div><h2>Thông báo cần chú ý</h2></div>
            <button onClick={() => navigate('/staff/notifications')}>Xem tất cả <RightOutlined /></button>
          </div>
          <button className="notice-row" onClick={() => navigate('/staff/verifications')}>
            <span className="notice-icon"><WarningOutlined /></span>
            <span>
              <strong>Có {data?.pendingVerification ?? 0} khai báo chờ xử lý</strong>
              <small>Ưu tiên xác minh trong hôm nay</small>
            </span>
          </button>
          <button className="notice-row" onClick={() => navigate('/staff/attention-students')}>
            <span className="notice-icon muted"><TeamOutlined /></span>
            <span>
              <strong>{data?.attentionCount ?? 0} sinh viên cần quan tâm</strong>
              <small>Kiểm tra tiến độ rèn luyện</small>
            </span>
          </button>
        </section>
      </div>
    </div>
  )
}
