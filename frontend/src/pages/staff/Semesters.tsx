import { useEffect, useState } from 'react'
import { statusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { deleteSemester, getSemesters, saveSemester, setCurrentSemester, type Semester } from '../../lib/api'

type Form = { id?: number; name: string; year: string; sm: number; sy: number; em: number; ey: number }
const TZ = 'Asia/Ho_Chi_Minh'
const day = (d: string) => new Date(d).toLocaleDateString('vi-VN', { timeZone: TZ })
// Tháng/năm của một mốc thời gian theo giờ Việt Nam.
const monthOf = (iso: string) => { const [y, m] = new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ }).split('-'); return { m: Number(m), y: Number(y) } }
const nowYear = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => `${nowYear - 2 + i}-${nowYear - 1 + i}`)
// Gợi ý khoảng tháng theo kỳ: HK1 9→1, HK2 2→6, Hè 7→8 (có thể chỉnh lại).
const suggest = (name: string, year: string): Pick<Form, 'sm' | 'sy' | 'em' | 'ey'> => {
  const y1 = Number(year.slice(0, 4))
  return name === 'HK1' ? { sm: 9, sy: y1, em: 1, ey: y1 + 1 } : name === 'HK2' ? { sm: 2, sy: y1 + 1, em: 6, ey: y1 + 1 } : { sm: 7, sy: y1 + 1, em: 8, ey: y1 + 1 }
}
const newForm = (): Form => ({ name: 'HK1', year: YEARS[2], ...suggest('HK1', YEARS[2]) })
const pad = (n: number) => String(n).padStart(2, '0')
// Gửi lên server ngày đầu của tháng bắt đầu và ngày cuối của tháng kết thúc.
const toPayload = (f: Form) => ({
  id: f.id, name: f.name, year: f.year,
  startDate: `${f.sy}-${pad(f.sm)}-01`,
  endDate: `${f.ey}-${pad(f.em)}-${pad(new Date(f.ey, f.em, 0).getDate())}`,
})

export default function StaffSemesters() {
  const [items, setItems] = useState<Semester[]>([])
  const [form, setForm] = useState<Form | null>(null)
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
        <button onClick={() => setForm(newForm())} className="btn-primary">+ Thêm học kỳ</button>
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
                    <button onClick={() => setForm({ id: s.id, name: s.name, year: s.year, sm: monthOf(s.startDate).m, sy: monthOf(s.startDate).y, em: monthOf(s.endDate).m, ey: monthOf(s.endDate).y })} className="btn-secondary text-xs py-1 px-2">Sửa</button>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sem-name" className="block text-sm font-medium text-slate-700 mb-1.5">Học kỳ</label>
                <select id="sem-name" className="select w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value, ...suggest(e.target.value, form.year) })}>
                  <option>HK1</option><option>HK2</option><option>HK Hè</option>
                </select>
              </div>
              <div>
                <label htmlFor="sem-year" className="block text-sm font-medium text-slate-700 mb-1.5">Năm học</label>
                <select id="sem-year" className="select w-full" value={form.year} onChange={e => setForm({ ...form, year: e.target.value, ...suggest(form.name, e.target.value) })}>
                  {(YEARS.includes(form.year) ? YEARS : [form.year, ...YEARS]).map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            {([['Từ tháng', 'sm', 'sy'], ['Đến tháng', 'em', 'ey']] as const).map(([label, mk, yk]) => (
              <div key={mk}>
                <div className="block text-sm font-medium text-slate-700 mb-1.5">{label}</div>
                <div className="grid grid-cols-2 gap-3">
                  <select aria-label={`${label} - tháng`} className="select w-full" value={form[mk]} onChange={e => setForm({ ...form, [mk]: Number(e.target.value) })}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
                  </select>
                  <select aria-label={`${label} - năm`} className="select w-full" value={form[yk]} onChange={e => setForm({ ...form, [yk]: Number(e.target.value) })}>
                    {[Number(form.year.slice(0, 4)), Number(form.year.slice(0, 4)) + 1].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-500">Học kỳ tính từ ngày 1 của tháng bắt đầu đến hết ngày cuối của tháng kết thúc. Không được trùng thời gian với học kỳ khác, không trùng tên trong cùng năm học và tối đa 6 tháng.</p>
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setForm(null)} className="btn-secondary">Hủy</button>
              <button
                onClick={() => {
                  if (form.ey * 12 + form.em < form.sy * 12 + form.sm) return setToast('Tháng kết thúc phải sau hoặc bằng tháng bắt đầu.')
                  run(() => saveSemester(toPayload(form) as Parameters<typeof saveSemester>[0]), 'Đã lưu học kỳ!')
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
