import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Typography, Tabs, Input, Checkbox, message, Alert, Modal } from 'antd'
import { GoogleOutlined, UserOutlined, LockOutlined, CrownOutlined, QuestionCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { loginWithCredentials, loginWithOAuth } from '../../lib/api'

import bgImage from '../../assets/background.jpg'
import logoImg from '../../assets/logo.png'

// TDTU Student Activity Management Login Component (Production Enhanced)
export default function Login() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'google' | 'admin'>('google')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [helpModalOpen, setHelpModalOpen] = useState(false)

  // Shared username/password state for Admin & Cán bộ credential login
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setErrorMessage(errorParam)
    }
  }, [searchParams])

  const handleCredentialLogin = async () => {
    if (!adminUsername.trim()) {
      message.error('Vui lòng nhập tên tài khoản hoặc email!')
      return
    }
    if (!adminPassword) {
      message.error('Vui lòng nhập mật khẩu!')
      return
    }

    setLoading(true)
    try {
      const res = await loginWithCredentials(adminUsername, adminPassword)
      message.success(`Đăng nhập thành công với quyền ${res.user.role}!`)
      window.location.href = res.redirectUrl
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Brand panel (desktop) */}
      <aside
        className="hidden lg:flex flex-col justify-between p-12 text-white bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.86)), url(${bgImage})` }}
      >
        <img src={logoImg} alt="Logo Trường Đại học Tôn Đức Thắng" className="h-14 w-auto object-contain self-start" />
        <div>
          <h1 className="text-3xl font-bold leading-snug">Quản lý hoạt động<br />và điểm rèn luyện</h1>
          <p className="mt-3 text-slate-200 max-w-md">
            Đăng ký hoạt động, khai báo minh chứng và theo dõi điểm rèn luyện của sinh viên Khoa Công nghệ Thông tin.
          </p>
        </div>
        <p className="text-sm text-slate-300">Trường Đại học Tôn Đức Thắng</p>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src={logoImg} alt="Logo Trường Đại học Tôn Đức Thắng" className="h-10 w-auto object-contain" />
            <span className="font-bold text-slate-900 leading-tight">Quản lý Hoạt động<br /><span className="font-medium text-slate-500 text-sm">Khoa CNTT – TDTU</span></span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Đăng nhập</h2>
          <p className="text-slate-600 mt-1 mb-6">Chọn cách đăng nhập phù hợp với tài khoản của bạn.</p>

          {/* Error Alert Banner */}
          {errorMessage && (
            <div className="mb-5">
              <Alert
                type="error"
                showIcon
                closable
                onClose={() => setErrorMessage(null)}
                message="Thông báo Đăng nhập"
                description={errorMessage}
                style={{ borderRadius: 10, border: '1px solid #fca5a5' }}
              />
            </div>
          )}

          {/* Tabs with Icons */}
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as 'google' | 'admin')}
            centered
            items={[
              {
                key: 'google',
                label: (
                  <span className="flex items-center gap-2 font-semibold text-sm">
                    <GoogleOutlined className="text-blue-600 text-base" />
                    Đăng nhập Google
                  </span>
                ),
              },
              {
                key: 'admin',
                label: (
                  <span className="flex items-center gap-2 font-semibold text-sm">
                    <CrownOutlined className="text-purple-600 text-base" />
                    Admin / Cán bộ
                  </span>
                ),
              },
            ]}
          />

          {/* TAB 1: GOOGLE OAUTH LOGIN */}
          {activeTab === 'google' && (
            <div className="mt-6 space-y-5">
              <div className="text-center px-1">
                <Typography.Text type="secondary" className="text-sm font-medium leading-relaxed block" style={{ color: '#475569' }}>
                  Chỉ sử dụng email do TDTU cấp (<span className="font-semibold text-slate-800">@tdtu.edu.vn</span> hoặc <span className="font-semibold text-slate-800">@student.tdtu.edu.vn</span>) để đăng nhập.
                </Typography.Text>
              </div>

              {/* Official Google Button Design */}
              <Button
                type="default"
                size="large"
                block
                loading={loading}
                icon={
                  <svg className="w-5 h-5 mr-1 inline-block" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                }
                className="h-12 text-base font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm hover:border-slate-400 rounded-lg flex items-center justify-center transition-all duration-200"
                onClick={() => {
                  setLoading(true)
                  loginWithOAuth()
                }}
              >
                <span className="text-slate-800 font-bold ml-1">Đăng nhập với Google</span>
              </Button>

              {/* Help & Support Link */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setHelpModalOpen(true)}
                  className="inline-flex items-center gap-1.5 min-h-10 px-2 rounded-md text-sm text-blue-700 hover:text-blue-800 font-medium hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                >
                  <QuestionCircleOutlined aria-hidden="true" />
                  <span>Hướng dẫn & Trợ giúp đăng nhập</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ADMIN / CÁN BỘ LOGIN FORM (role xác định theo tài khoản) */}
          {activeTab === 'admin' && (
            <form onSubmit={(e) => { e.preventDefault(); handleCredentialLogin() }} className="mt-5 space-y-4">
              <div>
                <label htmlFor="login-username" className="block text-sm font-semibold text-slate-700 mb-1">
                  Tài khoản / Email
                </label>
                <Input
                  id="login-username"
                  autoComplete="username"
                  autoFocus
                  size="large"
                  prefix={<UserOutlined className="text-slate-400" />}
                  placeholder="admin@tdtu.edu.vn hoặc staff.thu@tdtu.edu.vn"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700">Mật khẩu</label>
                  <a href="/forgot-password" className="text-sm text-blue-700 hover:underline font-medium">Quên mật khẩu?</a>
                </div>
                <Input.Password
                  id="login-password"
                  autoComplete="current-password"
                  size="large"
                  prefix={<LockOutlined className="text-slate-400" />}
                  placeholder="Nhập mật khẩu"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="rounded-lg"
                />
              </div>

              <div className="py-1">
                <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
                  <span className="text-sm text-slate-700">Ghi nhớ đăng nhập</span>
                </Checkbox>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 border-none rounded-lg shadow-sm"
              >
                Đăng nhập
              </Button>
            </form>
          )}

          <p className="mt-8 text-sm text-slate-500">
            © {new Date().getFullYear()} Khoa Công nghệ Thông tin — Đại học Tôn Đức Thắng
          </p>
        </div>
      </main>

      {/* Login Help Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
            <InfoCircleOutlined className="text-lg" />
            <span>Hướng dẫn Đăng nhập Sinh viên</span>
          </div>
        }
        open={helpModalOpen}
        onCancel={() => setHelpModalOpen(false)}
        footer={[
          <Button key="close" type="primary" className="bg-blue-600" onClick={() => setHelpModalOpen(false)}>
            Đã hiểu
          </Button>
        ]}
        style={{ borderRadius: 16 }}
      >
        <div className="space-y-3 py-2 text-slate-700 text-sm leading-relaxed">
          <p className="font-semibold text-slate-900">Các bước đăng nhập vào Hệ thống Quản lý Hoạt động:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Nhấn vào nút <span className="font-semibold text-blue-600">"Đăng nhập với Google"</span>.</li>
            <li>Chọn tài khoản Google Email do TDTU cấp có đuôi <code className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono text-xs">@student.tdtu.edu.vn</code> hoặc <code className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono text-xs">@tdtu.edu.vn</code>.</li>
            <li>Nếu là lần đầu đăng nhập, hệ thống sẽ tự động tạo hồ sơ sinh viên của bạn.</li>
          </ol>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm mt-3 flex gap-2">
            <WarningOutlined aria-hidden="true" className="mt-0.5" />
            <span><strong>Lưu ý:</strong> Nếu dùng email cá nhân (như Gmail cá nhân), hệ thống sẽ từ chối truy cập. Vui lòng đăng xuất và chọn lại email TDTU.</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}




