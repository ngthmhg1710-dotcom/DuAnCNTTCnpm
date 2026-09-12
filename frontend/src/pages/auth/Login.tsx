import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Typography, Input, Checkbox, message, Alert } from 'antd'
import { GoogleOutlined, UserOutlined, LockOutlined, CrownOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { loginWithCredentials, loginWithOAuth } from '../../lib/api'

import bgImage from '../../assets/background.jpg'

// TDTU Student Activity Management Login Component (Glassmorphism 3D Style)
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
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 md:p-8 relative overflow-hidden select-none"
      style={{
        backgroundImage: `radial-gradient(ellipse at center, rgba(15, 23, 42, 0.45) 0%, rgba(10, 16, 30, 0.85) 100%), linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(15, 23, 42, 0.7)), url(${bgImage})`
      }}
    >
      {/* 3D Floating Decorative Glass Elements (matching user reference screenshot) */}
      <div className="absolute top-12 left-10 w-40 h-40 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 blur-2xl animate-float-1 pointer-events-none" />
      <div className="absolute bottom-16 right-12 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/25 blur-3xl animate-float-2 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full border-4 border-cyan-400/20 blur-md animate-float-3 pointer-events-none" />
      
      {/* Abstract 3D Ribbon / Torus SVG Accents */}
      <svg className="absolute -top-10 right-10 w-72 h-72 text-cyan-400/10 animate-float-1 pointer-events-none" viewBox="0 0 200 200" fill="none">
        <path d="M40 100 C 40 40, 160 40, 160 100 C 160 160, 40 160, 40 100" stroke="currentColor" strokeWidth="24" strokeLinecap="round" />
      </svg>
      <svg className="absolute -bottom-12 -left-12 w-80 h-80 text-blue-400/10 animate-float-2 pointer-events-none" viewBox="0 0 200 200" fill="none">
        <path d="M20 60 Q 100 0, 180 60 T 20 180" stroke="currentColor" strokeWidth="30" strokeLinecap="round" />
      </svg>

      {/* Large Outer Translucent Backdrop Box */}
      <div className="w-full max-w-4xl glass-backdrop p-6 sm:p-10 md:p-12 relative z-10 flex flex-col items-center justify-center transition-all duration-300">
        
        {/* Main Header Branding */}
        <div className="text-center mb-8 max-w-xl">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30 mb-3 border border-white/20">
            <SafetyCertificateOutlined className="text-2xl text-white" />
          </div>
          <Typography.Title 
            level={2} 
            style={{ 
              color: '#ffffff', 
              margin: 0, 
              fontWeight: 800,
              fontSize: '26px',
              letterSpacing: '-0.02em',
              textShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
          >
            Trường Đại học Tôn Đức Thắng
          </Typography.Title>
          <Typography.Text style={{ color: '#93c5fd', fontSize: '14px', fontWeight: 500 }} className="block mt-1">
            Khoa Công nghệ Thông tin — Quản lý Hoạt động & Điểm Rèn luyện
          </Typography.Text>
        </div>

        {/* Main Inner Glass Card */}
        <div className="w-full max-w-md glass-card p-6 sm:p-8 relative">
          
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
                style={{ borderRadius: 12, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fecdd3' }}
              />
            </div>
          )}

          {/* Modern Glass Pill Tab Switcher */}
          <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('google')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === 'google'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <GoogleOutlined className="text-base" />
              <span>Sinh viên (Google)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <CrownOutlined className="text-base" />
              <span>Đăng nhập Admin</span>
            </button>
          </div>

          {/* TAB 1: GOOGLE OAUTH LOGIN */}
          {activeTab === 'google' && (
            <div className="space-y-6 text-center py-2">
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3.5">
                <Typography.Text className="text-xs text-blue-200 leading-relaxed block font-medium">
                  Chỉ sử dụng email do TDTU cấp (<span className="text-white font-semibold">@tdtu.edu.vn</span> hoặc <span className="text-white font-semibold">@student.tdtu.edu.vn</span>) để đăng nhập hệ thống.
                </Typography.Text>
              </div>

              <Button
                type="primary"
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
                className="h-12 text-base font-semibold bg-white hover:bg-slate-100 text-slate-900 border-none shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-xl flex items-center justify-center"
                onClick={() => {
                  setLoading(true)
                  loginWithOAuth()
                }}
              >
                <span className="text-slate-800 font-bold ml-1">Đăng nhập với Google</span>
              </Button>
            </div>
          )}

          {/* TAB 2: ADMIN LOGIN FORM */}
          {activeTab === 'admin' && (
            <form onSubmit={(e) => { e.preventDefault(); handleAdminLogin() }} className="space-y-4 glass-input py-1">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
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
                  <label className="block text-xs font-semibold text-slate-200">Mật khẩu</label>
                  <a href="/forgot-password" className="text-xs text-cyan-300 hover:text-cyan-200 transition-colors">Quên mật khẩu?</a>
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
                  <span className="text-xs text-slate-300">Ghi nhớ đăng nhập</span>
                </Checkbox>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none shadow-lg shadow-indigo-500/30 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Đăng nhập Admin
              </Button>
            </form>
          )}
          
        </div>

        {/* Footer Credit */}
        <div className="mt-6 text-center">
          <Typography.Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>
            © {new Date().getFullYear()} TDTU Faculty of Information Technology. All rights reserved.
          </Typography.Text>
        </div>

      </div>
    </div>
  )
}

