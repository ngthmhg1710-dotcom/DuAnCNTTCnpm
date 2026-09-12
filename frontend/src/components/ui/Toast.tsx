import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${colors[type]} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium`}>
      {type === 'success' && '✓'} {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">&times;</button>
    </div>
  )
}
