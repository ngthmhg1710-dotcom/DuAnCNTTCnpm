import { useEffect, useState } from 'react'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { deleteSemester, getSemesters, saveSemester, setCurrentSemester, type Semester } from '../../lib/api'

const empty = { name: 'HK1', year: '', startDate: '', endDate: '' }
const day = (d: string) => new Date(d).toLocaleDateString('vi-VN')

export default function StaffSemesters() {
  const [items, setItems] = useState<Semester[]>([])
  const [form, setForm] = useState<(typeof empty & { id?: number }) | null>(null)
  const [toast, setToast] = useState('')

  const load = () => getSemesters().then(setItems).catch(() => setToast('Không tải được danh sách học kỳ.'))
  useEffect(() => { load() }, [])

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try { await fn(); setToast(ok); setForm(null); load() }
    catch (e: any) { setToast(e?.response?.data?.message?.toString() || 'Thao tác thất bại.') }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý học kỳ</h1>
        <button onClick={() => setForm(empty)} className="btn-primary">+ Thêm học kỳ</button>
      </div>
      <div className="card overflow-hidden">
        <div className="table-responsive-wrapper">
          <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-3">Học kỳ</th>
              <th className="text-left px-4 py-3">Năm học</th>
              <th className="text-left px-4 py-3">Bắt đầu</th>
              <th className="text-left px-4 py-3">Kết thúc</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map(s => (
              <tr key={s.id} className="table-row">
                <td className="px-4 py-3 font-semibold text-slate-800">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.year}</td>
                <td className="px-4 py-3 text-slate-600">{day(s.startDate)}</td>
                <td className="px-4 py-3 text-slate-600">{day(s.endDate)}</td>
                <td className="px-4 py-3">{statusBadge(s.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => setForm({ id: s.id, name: s.name, year: s.year, startDate: s.startDate.slice(0, 10), endDate: s.endDate.slice(0, 10) })} className="btn-secondary text-xs py-1 px-2">Sửa</button>
                    {!s.isCurrent && (
                      <button onClick={() => run(() => setCurrentSemester(s.id), 'Đã đặt làm học kỳ hiện tại!')} className="btn-primary text-xs py-1 px-2">Đặt hiện tại</button>
                    )}
                    <button
                      onClick={() => confirm(`Xóa học kỳ ${s.name} ${s.year}? Các tiêu chí của học kỳ này cũng bị xóa.`) && run(() => deleteSemester(s.id), 'Đã xóa học kỳ.')}
                      className="btn-secondary text-xs py-1 px-2 text-red-500"
                    >Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-slate-500">Chưa có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {form && (
        <Modal title={form.id ? 'Sửa học kỳ' : 'Thêm học kỳ'} onClose={() => setForm(null)}>
          <div className="space-y-3">
            <div>
              <label htmlFor="sem-name" className="block text-sm font-medium text-slate-700 mb-1.5">Học kỳ</label>
              <select id="sem-name" className="select w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}>
                <option>HK1</option><option>HK2</option><option>HK Hè</option>
              </select>
            </div>
            <div>
              <label htmlFor="sem-year" className="block text-sm font-medium text-slate-700 mb-1.5">Năm học</label>
              <input id="sem-year" className="input" placeholder="2026-2027" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sem-start" className="block text-sm font-medium text-slate-700 mb-1.5">Bắt đầu</label>
                <input id="sem-start" type="date" className="input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label htmlFor="sem-end" className="block text-sm font-medium text-slate-700 mb-1.5">Kết thúc</label>
                <input id="sem-end" type="date" className="input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setForm(null)} className="btn-secondary">Hủy</button>
              <button
                onClick={() => {
                  if (!form.year || !form.startDate || !form.endDate) return setToast('Vui lòng nhập đủ thông tin.')
                  if (form.endDate < form.startDate) return setToast('Ngày kết thúc phải sau ngày bắt đầu.')
                  run(() => saveSemester(form), 'Đã lưu học kỳ!')
                }}
                className="btn-primary"
              >Lưu</button>
            </div>
          </div>
        </Modal>
      )}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
