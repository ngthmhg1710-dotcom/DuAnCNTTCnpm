import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Typography, Input, Checkbox, message, Alert } from 'antd'
import { GoogleOutlined, UserOutlined, LockOutlined, CrownOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { loginWithCredentials, loginWithOAuth } from '../../lib/api'

import bgImage from '../../assets/background.jpg'

// TDTU Student Activity Management Login Component (Bright Glassmorphism)
export default function Login() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'google' | 'admin'>('google')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Admin credentials state
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setErrorMessage(errorParam)
    }
  }, [searchParams])

  const handleAdminLogin = async () => {
    if (!adminUsername.trim()) {
      message.error('Vui lòng nhập tên tài khoản hoặc email Admin!')
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
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(30, 58, 138, 0.35) 0%, rgba(15, 23, 42, 0.45) 100%), url(${bgImage})`
      }}
    >
      {/* Subtle Ambient Glowing Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-cyan-400/25 blur-3xl animate-float-1 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-500/25 blur-3xl animate-float-2 pointer-events-none" />

      {/* Main Centered Bright Glass Card */}
      <div className="w-full max-w-md glass-card-bright p-7 sm:p-9 relative z-10 shadow-2xl transition-all duration-300">
        
        {/* Header Branding */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-3.5 border border-white/40">
            <SafetyCertificateOutlined className="text-2xl text-white" />
          </div>
          <Typography.Title 
            level={3} 
            style={{ 
              color: '#0f172a', 
              margin: 0, 
              fontWeight: 800,
              fontSize: '22px',
              letterSpacing: '-0.01em'
            }}
          >
            Trường Đại học Tôn Đức Thắng
          </Typography.Title>
          <Typography.Text style={{ color: '#2563eb', fontSize: '13px', fontWeight: 600 }} className="block mt-1">
            Khoa Công nghệ Thông tin — Quản lý Hoạt động & Điểm Rèn luyện
          </Typography.Text>
        </div>

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
              style={{ borderRadius: 12, background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b' }}
            />
          </div>
        )}

        {/* High-Contrast Glass Pill Tab Switcher */}
        <div className="flex bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'google'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
            }`}
          >
            <GoogleOutlined className="text-base" />
            <span>Sinh viên (Google)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 hover:text-purple-600 hover:bg-white/60'
            }`}
          >
            <CrownOutlined className="text-base" />
            <span>Đăng nhập Admin</span>
          </button>
        </div>

        {/* TAB 1: GOOGLE OAUTH LOGIN */}
        {activeTab === 'google' && (
          <div className="space-y-6 text-center py-1">
            <div className="bg-blue-50/90 border border-blue-200/80 rounded-xl p-4 text-left">
              <p className="text-xs text-blue-900 leading-relaxed font-medium m-0">
                📌 Chỉ sử dụng email do TDTU cấp (<span className="text-blue-700 font-bold">@tdtu.edu.vn</span> hoặc <span className="text-blue-700 font-bold">@student.tdtu.edu.vn</span>) để đăng nhập hệ thống.
              </p>
            </div>

            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              icon={
                <svg className="w-5 h-5 mr-1 inline-block" viewBox="0 0 24 24">
                  <path fill="#ffffff" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#ffffff" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#ffffff" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z" />
                  <path fill="#ffffff" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
              }
              className="h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-none shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-xl flex items-center justify-center"
              onClick={() => {
                setLoading(true)
                loginWithOAuth()
              }}
            >
              <span className="ml-1">Đăng nhập với Google</span>
            </Button>
          </div>
        )}

        {/* TAB 2: ADMIN LOGIN FORM */}
        {activeTab === 'admin' && (
          <form onSubmit={(e) => { e.preventDefault(); handleAdminLogin() }} className="space-y-4 glass-input-bright py-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tài khoản Admin / Email
              </label>
              <Input
                size="large"
                prefix={<UserOutlined className="text-slate-400" />}
                placeholder="admin@tdtu.edu.vn"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Mật khẩu</label>
                <a href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">Quên mật khẩu?</a>
              </div>
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-slate-400" />}
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>

            <div className="py-1">
              <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
                <span className="text-xs font-semibold text-slate-600">Ghi nhớ đăng nhập</span>
              </Checkbox>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className="h-12 text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-none shadow-lg shadow-purple-600/30 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Đăng nhập Admin
            </Button>
          </form>
        )}
        
        {/* Footer Credit */}
        <div className="mt-7 text-center pt-4 border-t border-slate-200/60">
          <Typography.Text style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>
            © {new Date().getFullYear()} TDTU Faculty of Information Technology. All rights reserved.
          </Typography.Text>
        </div>

      </div>
    </div>
  )
}


