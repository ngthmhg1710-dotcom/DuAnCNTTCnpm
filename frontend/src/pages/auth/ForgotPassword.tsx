import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg shadow-md p-7">
          <Link to="/login" className="text-slate-400 text-sm hover:text-slate-600 flex items-center gap-1 mb-5">← Quay lại</Link>
          <h2 className="text-slate-800 font-bold text-lg mb-1">Quên mật khẩu</h2>
          <p className="text-slate-500 text-sm mb-6">Nhập email trường của bạn để nhận link đặt lại mật khẩu.</p>
          {sent ? (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-4 text-sm">
              ✓ Đã gửi email đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư.
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSent(true) }} className="space-y-4">
              <div>
                <label htmlFor="forgotpassword-f1" className="block text-sm font-medium text-slate-700 mb-1.5">Email trường</label>
                <input id="forgotpassword-f1" className="input" placeholder="mssv@student.tdtu.edu.vn" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-2.5">Gửi yêu cầu</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
