import { useState } from 'react'
import { Toast } from '../../components/ui/Toast'

const tabs = ['Chung', 'Bảo mật', 'Thông báo', 'Học kỳ', 'Tích hợp', 'Audit']

export default function AdminSettings() {
  const [tab, setTab] = useState(0)
  const [toast, setToast] = useState('')

  return (
    <div className="page-container max-w-3xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Cài đặt hệ thống</h1>
      </div>

      <div className="flex border-b border-slate-200 mb-5 overflow-x-auto">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${tab === i ? 'tab-active' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
        ))}
      </div>

      <div className="card p-6 space-y-4">
        {tab === 0 && (
          <>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Tên hệ thống</label><input className="input" defaultValue="Hệ thống Quản lý Hoạt động Sinh viên – Khoa CNTT TDTU" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email hỗ trợ</label><input className="input" defaultValue="ctsv.cntt@tdtu.edu.vn" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">URL hệ thống</label><input className="input" defaultValue="https://hoatdong.cntt.tdtu.edu.vn" /></div>
          </>
        )}
        {tab === 1 && (
          <>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Thời gian phiên làm việc (phút)</label><input type="number" className="input" defaultValue={60} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Độ dài mật khẩu tối thiểu</label><input type="number" className="input" defaultValue={8} /></div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="twofa" defaultChecked />
              <label htmlFor="twofa" className="text-sm font-medium text-slate-700">Yêu cầu xác thực 2 bước cho Admin</label>
            </div>
          </>
        )}
        {tab === 2 && (
          <>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="email" defaultChecked />
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Gửi email thông báo</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="inapp" defaultChecked />
              <label htmlFor="inapp" className="text-sm font-medium text-slate-700">Thông báo trong ứng dụng</label>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">SMTP Server</label><input className="input" defaultValue="smtp.tdtu.edu.vn" /></div>
          </>
        )}
        {tab === 3 && (
          <>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Học kỳ hiện tại</label>
              <select className="select w-full"><option>HK1 2024-2025</option><option>HK2 2024-2025</option></select></div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="autoclose" />
              <label htmlFor="autoclose" className="text-sm font-medium text-slate-700">Tự động kết thúc học kỳ theo ngày</label>
            </div>
          </>
        )}
        {tab === 4 && (
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Timeout API mặc định (giây)</label><input type="number" className="input" defaultValue={30} /></div>
        )}
        {tab === 5 && (
          <>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="auditall" defaultChecked />
              <label htmlFor="auditall" className="text-sm font-medium text-slate-700">Ghi lại toàn bộ hành động</label>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Lưu log trong (ngày)</label><input type="number" className="input" defaultValue={365} /></div>
          </>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button onClick={() => setToast('Đã lưu cài đặt!')} className="btn-primary">Lưu cài đặt</button>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
