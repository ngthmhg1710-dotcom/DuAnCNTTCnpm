import { useEffect, useMemo, useState } from 'react'
import { Select } from 'antd'
import { useNavigate } from 'react-router-dom'
import { Toast } from '../../components/ui/Toast'
import { createDeclaration, getActivities, type Activity, type EvidenceFile } from '../../lib/api'

const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }) : '')
const fmt = (iso: string) => new Date(iso).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })

// Images are shrunk to <=1280px JPEG so the request stays small; PDFs are sent as-is (<=2MB).
function readEvidence(file: File): Promise<EvidenceFile | null> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onerror = () => resolve(null)
    reader.onload = () => {
      const data = reader.result as string
      if (!file.type.startsWith('image/')) return resolve(file.size <= 2 * 1024 * 1024 ? { name: file.name, data } : null)
      const img = new Image()
      img.onerror = () => resolve(null)
      img.onload = () => {
        const k = Math.min(1, 1280 / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = img.width * k
        c.height = img.height * k
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
        resolve({ name: file.name, data: c.toDataURL('image/jpeg', 0.8) })
      }
      img.src = data
    }
    reader.readAsDataURL(file)
  })
}

export default function DeclarationCreate() {
  const navigate = useNavigate()
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ activityId: 0, content: '', description: '' })
  const [activities, setActivities] = useState<Activity[]>([])
  useEffect(() => { getActivities().then(list => setActivities(list.filter(a => a.status !== 'Đã hủy'))).catch(() => setToast('Không tải được danh sách hoạt động.')) }, [])
  // Thông tin hoạt động lấy từ hoạt động đã chọn, sinh viên không sửa được.
  const picked = useMemo(() => activities.find(a => a.id === form.activityId), [activities, form.activityId])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<EvidenceFile[]>([])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.activityId) e.name = 'Vui lòng chọn hoạt động từ danh sách'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (draft: boolean) => {
    if (!validate()) return
    try {
      await createDeclaration({ activityId: form.activityId, content: form.content, description: form.description, files, isDraft: draft })
      setToast(draft ? 'Đã lưu nháp.' : 'Khai báo đã được gửi thành công!')
      setTimeout(() => navigate('/student/declarations'), 1200)
    } catch (err: any) {
      setToast(err?.message || 'Không gửi được khai báo.')
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm hover:text-slate-600 mb-5 flex items-center gap-1">← Quay lại</button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Khai báo hoạt động mới</h1>

      <div className="card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="declarationcreate-f1" className="block text-sm font-medium text-slate-700 mb-1.5">Hoạt động <span className="text-red-500">*</span></label>
            <Select id="declarationcreate-f1" showSearch className="w-full" size="large" placeholder="Chọn hoạt động trong danh sách"
              value={form.activityId || undefined} onChange={(v: number) => setForm(f => ({ ...f, activityId: v }))}
              optionFilterProp="label" notFoundContent="Không có hoạt động nào"
              options={[...activities].sort((x, y) => +new Date(y.startAt) - +new Date(x.startAt)).map(a => ({ value: a.id, label: `${a.title} (${fmt(a.startAt)})` }))} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            <p className="text-xs text-slate-400 mt-1">Chỉ khai báo được hoạt động đã có trong hệ thống. Thông tin bên dưới tự điền theo hoạt động bạn chọn.</p>
          </div>
          {picked && (
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg bg-slate-50 border border-slate-100 p-4 text-sm">
              <div><div className="text-xs text-slate-400">Loại hoạt động</div><div className="text-slate-800">{picked.category}</div></div>
              <div><div className="text-xs text-slate-400">Đơn vị tổ chức</div><div className="text-slate-800">{picked.unit || 'Khoa Công nghệ thông tin'}</div></div>
              <div><div className="text-xs text-slate-400">Thời gian</div><div className="text-slate-800">{fmt(picked.startAt)}{picked.endAt && day(picked.endAt) !== day(picked.startAt) ? ` đến ${fmt(picked.endAt)}` : ''}</div></div>
              <div><div className="text-xs text-slate-400">Địa điểm</div><div className="text-slate-800">{picked.location || 'Chưa cập nhật'}</div></div>
            </div>
          )}
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="declarationcreate-f7" className="block text-sm font-medium text-slate-700 mb-1.5">Nội dung hoạt động</label>
            <textarea id="declarationcreate-f7" className="input min-h-[80px] resize-none" placeholder="Mô tả nội dung đã tham gia..." value={form.content} onChange={set('content')} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="declarationcreate-f8" className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả thêm</label>
            <textarea id="declarationcreate-f8" className="input min-h-[60px] resize-none" placeholder="Thông tin bổ sung..." value={form.description} onChange={set('description')} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Minh chứng</label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
              <div className="text-slate-400 text-sm mb-2">📎 Kéo thả file hoặc click để chọn</div>
              <div className="text-slate-400 text-xs">Chấp nhận: PDF, JPG, PNG · Tối đa 3 file · PDF tối đa 2MB</div>
              <input type="file" className="hidden" id="fileUpload" multiple onChange={async e => {
                const read = await Promise.all(Array.from(e.target.files ?? []).map(readEvidence))
                const ok = read.filter((f): f is EvidenceFile => !!f)
                if (files.length + ok.length > 3) setToast('Chỉ được đính kèm tối đa 3 minh chứng. Các file dư đã bị bỏ qua.')
                else if (ok.length < read.length) setToast('Có file không đọc được hoặc quá lớn (PDF tối đa 2MB).')
                setFiles(prev => [...prev, ...ok].slice(0, 3))
                e.target.value = ''
              }} />
              <label htmlFor="fileUpload" className="btn-secondary mt-3 cursor-pointer inline-flex">Chọn file</label>
            </div>
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg text-sm">
                    📄 <span className="text-slate-700">{f.name}</span>
                    <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="ml-auto text-slate-400 hover:text-red-500">&times;</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:justify-end border-t border-slate-100">
          <button onClick={() => navigate(-1)} className="btn-secondary justify-center">Hủy</button>
          <button onClick={() => handleSubmit(true)} className="btn-secondary justify-center">Lưu nháp</button>
          <button onClick={() => handleSubmit(false)} className="btn-primary justify-center">Gửi khai báo</button>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
