import { type ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  width?: string
}

export function Modal({ title, onClose, children, width = 'max-w-md' }: ModalProps) {
  return (
    <div className="modal-overlay p-4" onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-white rounded-lg shadow-md w-full max-h-[90vh] flex flex-col ${width}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
          <h3 className="text-base font-semibold text-slate-800 pr-2 leading-tight">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Đóng" className="text-slate-500 hover:text-slate-700 text-xl leading-none w-10 h-10 cursor-pointer rounded-md">&times;</button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}
