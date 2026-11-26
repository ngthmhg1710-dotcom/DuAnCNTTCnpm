import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarOutlined, RightOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons'
import { getAccounts, getAnalyticsOverview } from '../../lib/api'

const ROLES = [
  { name: 'Sinh viên', dot: 'bg-sky-500' },
  { name: 'Cán bộ', dot: 'bg-emerald-500' },
  { name: 'Admin', dot: 'bg-violet-500' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<any[]>([])
  const [overview, setOverview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    fetch('https://worldtimeapi.org/api/timezone/Asia/Ho_Chi_Minh')
      .then(r => r.json())
      .then(d => setNow(new Date(d.datetime)))
      .catch(() => setNow(new Date()))
  }, [])

  useEffect(() => {
    Promise.allSettled([getAccounts(), getAnalyticsOverview()]).then(([a, o]) => {
      if (a.status === 'fulfilled') setAccounts(a.value)
      if (o.status === 'fulfilled') setOverview(o.value)
      setLoading(false)
    })
  }, [])

  const total = accounts.length
  const locked = accounts.filter(a => a.status === 'Khóa').length
  const byRole = ROLES.map(r => ({
    ...r,
    count: accounts.filter(a => a.role === r.name).length,
  }))
  const summary = overview?.summary
  const num = (value?: number) => loading ? '…' : (value ?? 0).toLocaleString('vi-VN')
  const lockedLabel = loading ? '…' : locked.toLocaleString('vi-VN')

  return (
    <div className="page-container student-dashboard">
      <header className="dashboard-welcome">
        <div>
          <span className="semester-label">Hệ thống · Học kỳ 1/2026–2027</span>
          <h1>Chào buổi sáng, Quản trị viên.</h1>
          <p>Theo dõi tài khoản, cấu hình và hoạt động chung của hệ thống.</p>
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
            <strong>{num(total)}</strong>
          </div>
          <div>
            <p>Tổng tài khoản trong hệ thống</p>
            <h2>{loading ? 'Đang tải' : 'Tài khoản đang hoạt động'}</h2>
            <span className="verified-label">{lockedLabel} tài khoản bị khóa</span>
          </div>
        </div>
        <div className="score-progress">
          <div className="progress-heading">
            <span>Phân bố theo vai trò</span>
            <strong>{total ? '100%' : '0%'}</strong>
          </div>
          <div className="progress-track">
            {byRole.map(r => (
              <div
                key={r.name}
                className={
                  r.name === 'Sinh viên' ? 'role-bar-student' :
                  r.name === 'Cán bộ' ? 'role-bar-staff' : 'role-bar-admin'
                }
                style={{ width: `${total ? (r.count / total) * 100 : 0}%` }}
              />
            ))}
          </div>
          <p>
            {byRole.map(r => (
              <span className="role-progress-label" key={r.name}>
                <i className={r.dot} /> {r.name}: <strong>{loading ? '…' : r.count}</strong>
              </span>
            ))}
          </p>
        </div>
        <button className="score-detail" onClick={() => navigate('/admin/accounts')}>
          Xem chi tiết <RightOutlined />
        </button>
      </section>

      <section className="category-grid">
        {[
          ['Hoạt động', num(summary?.activities), 'Trong hệ thống', 'bg-blue-500'],
          ['Lượt tham gia', num(summary?.participations), 'Đã ghi nhận', 'bg-emerald-500'],
          ['Khai báo', num(summary?.declarations), 'Tổng yêu cầu', 'bg-violet-500'],
          ['Tài khoản khóa', lockedLabel, 'Cần kiểm tra', 'bg-amber-500'],
        ].map(([name, score, state, dot]) => (
          <button key={name} className="category-item" onClick={() => navigate('/admin/accounts')}>
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
        <div className="declaration-icon"><SettingOutlined /></div>
        <div className="declaration-copy">
          <h2>Cấu hình hệ thống cần được kiểm tra?</h2>
          <p>Quản lý tài khoản, phân quyền, danh mục và các kết nối tích hợp.</p>
        </div>
        <button onClick={() => navigate('/admin/settings')}>
          <SettingOutlined /> Mở cài đặt
        </button>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <span>Quản trị</span>
            <h2>Hoạt động quản trị nổi bật</h2>
            <p>Theo dõi các khu vực đang cần quản lý.</p>
          </div>
          <button onClick={() => navigate('/admin/audit-logs')}>Xem tất cả <RightOutlined /></button>
        </div>

        <div className="featured-grid">
          {[
            ['Nhật ký hệ thống', 'Theo dõi các thay đổi và truy cập', '/admin/audit-logs', 'Đang ghi nhận'],
            ['Tài khoản người dùng', `${total} tài khoản trong hệ thống`, '/admin/accounts', 'Quản lý'],
            ['Vai trò & phân quyền', 'Kiểm tra quyền truy cập', '/admin/roles', 'Cấu hình'],
          ].map(([title, description, route, status]) => (
            <article className="featured-card" key={title}>
              <button className="featured-card-main" onClick={() => navigate(route)}>
                <div className="featured-meta">
                  <span>{status}</span>
                  <span className="open">Quản trị</span>
                </div>
                <h3>{title}</h3>
                <div className="featured-details">
                  <span><TeamOutlined /> {description}</span>
                </div>
              </button>
              <button className="featured-link" onClick={() => navigate(route)}>
                Xem chi tiết <RightOutlined />
              </button>
            </article>
          ))}
        </div>
      </section>

      <div className="dashboard-bottom">
        <section className="dashboard-panel">
          <div className="section-heading compact">
            <div><h2>Tài khoản mới nhất</h2></div>
            <button onClick={() => navigate('/admin/accounts')}>Xem tất cả <RightOutlined /></button>
          </div>
          {accounts.length ? accounts.slice(-4).reverse().map((account, index) => (
            <button
              key={account.id}
              className="schedule-row"
              onClick={() => navigate(`/admin/accounts/${account.id}`)}
            >
              <span className="schedule-date"><strong>{index + 1}</strong><small>TK</small></span>
              <span className="schedule-copy">
                <strong>{account.name}</strong>
                <small>{account.email}</small>
              </span>
              <span className="schedule-offset">{account.role}</span>
            </button>
          )) : (
            <div className="dashboard-empty compact-empty">Chưa có dữ liệu tài khoản.</div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="section-heading compact">
            <div><h2>Trạng thái khai báo</h2></div>
            <button onClick={() => navigate('/admin/audit-logs')}>Kiểm tra <RightOutlined /></button>
          </div>
          {(overview?.byDeclarationStatus ?? []).slice(0, 4).map((item: any, index: number) => (
            <button className="notice-row" key={`${item.status}-${index}`} onClick={() => navigate('/admin/audit-logs')}>
              <span className="notice-icon"><SettingOutlined /></span>
              <span>
                <strong>{item.status}</strong>
                <small>{item.value} yêu cầu</small>
              </span>
            </button>
          ))}
          {!(overview?.byDeclarationStatus?.length) && (
            <div className="dashboard-empty compact-empty">Chưa có dữ liệu khai báo.</div>
          )}
        </section>
      </div>
    </div>
  )
}
