import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Card, Typography, Tabs, Input, Checkbox, message, Alert } from 'antd'
import { GoogleOutlined, UserOutlined, LockOutlined, CrownOutlined } from '@ant-design/icons'
import { loginWithCredentials, loginWithOAuth } from '../../lib/api'

import bgImage from '../../../public/img/background.jpg'

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
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8)), url(${bgImage})`
      }}
    >
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <Typography.Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
            Trường Đại học Tôn Đức Thắng
          </Typography.Title>
          <Typography.Text style={{ color: '#94a3b8', fontSize: '14px' }}>
            Khoa Công nghệ Thông tin — Quản lý Hoạt động & Điểm Rèn luyện
          </Typography.Text>
        </div>

        {/* Main Auth Card */}
        <Card
          styles={{ body: { padding: '24px 28px' } }}
          style={{
            borderRadius: 16,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            background: '#ffffff'
          }}
        >
          {/* Beautiful Error Alert Banner */}
          {errorMessage && (
            <div className="mb-5">
              <Alert
                type="error"
                showIcon
                closable
                onClose={() => setErrorMessage(null)}
                message="Không thể đăng nhập"
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
                  <span className="flex items-center gap-2 font-medium">
                    <GoogleOutlined className="text-blue-600 text-base" />
                    Đăng nhập Google
                  </span>
                ),
              },
              {
                key: 'admin',
                label: (
                  <span className="flex items-center gap-2 font-medium">
                    <CrownOutlined className="text-purple-600 text-base" />
                    Đăng nhập Admin
                  </span>
                ),
              },
            ]}
          />

          {/* TAB 1: GOOGLE OAUTH LOGIN */}
          {activeTab === 'google' && (
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Typography.Text type="secondary" className="text-xs font-medium">
                  Chỉ sử dụng email do TDTU cấp (@tdtu.edu.vn hoặc @student.tdtu.edu.vn) để đăng nhập.
                </Typography.Text>
              </div>

              <Button
                type="primary"
                size="large"
                block
                loading={loading}
                icon={<GoogleOutlined />}
                className="h-12 text-base font-semibold bg-blue-600 hover:bg-blue-500 border-none shadow-sm"
                onClick={() => {
                  setLoading(true)
                  loginWithOAuth()
                }}
              >
                Đăng nhập với Google
              </Button>
            </div>
          )}

          {/* TAB 2: ADMIN LOGIN FORM */}
          {activeTab === 'admin' && (
            <form onSubmit={(e) => { e.preventDefault(); handleAdminLogin() }} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tài khoản Admin / Email
                </label>
                <Input
                  size="large"
                  prefix={<UserOutlined className="text-slate-400" />}
                  placeholder="Nhập tên đăng nhập hoặc email..."
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Mật khẩu</label>
                  <a href="/forgot-password" className="text-xs text-blue-600 hover:underline">Quên mật khẩu?</a>
                </div>
                <Input.Password
                  size="large"
                  prefix={<LockOutlined className="text-slate-400" />}
                  placeholder="Nhập mật khẩu..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>

              <div className="py-1">
                <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
                  <span className="text-xs text-slate-600">Ghi nhớ đăng nhập</span>
                </Checkbox>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="h-11 text-base font-semibold bg-slate-800 hover:bg-slate-700 border-none"
              >
                Đăng nhập Admin
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
