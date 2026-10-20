import { Modal } from './Modal'

export type ImportResultData = { created: number; errors: string[] }

export default function ImportResult({ result, onClose }: { result: ImportResultData; onClose: () => void }) {
  const { created, errors } = result
  return (
    <Modal title="Kết quả import" onClose={onClose}>
      <div className="flex gap-3 mb-4">
        <div className="flex-1 rounded-lg bg-green-50 text-green-700 p-3 text-center">
          <div className="text-2xl font-bold">{created}</div>
          <div className="text-xs">Thêm thành công</div>
        </div>
        <div className={`flex-1 rounded-lg p-3 text-center ${errors.length ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-500'}`}>
          <div className="text-2xl font-bold">{errors.length}</div>
          <div className="text-xs">Dòng lỗi</div>
        </div>
      </div>
      {errors.length > 0 && (
        <ul className="text-sm text-red-700 space-y-1 max-h-60 overflow-y-auto">
          {errors.map(e => <li key={e}>• {e}</li>)}
        </ul>
      )}
      <div className="flex justify-end pt-4">
        <button onClick={onClose} className="btn-primary">Đóng</button>
      </div>
    </Modal>
  )
}
