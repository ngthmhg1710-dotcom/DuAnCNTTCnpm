import { useState } from 'react'
import type { EvidenceFile } from '../../lib/api'

// Browsers block top-level navigation to data: URLs, so images open in an in-page overlay
// and PDFs are converted to a blob: URL first.
const openPdf = async (f: EvidenceFile) => {
  const blob = await (await fetch(f.data)).blob()
  window.open(URL.createObjectURL(blob), '_blank')
}

export default function Evidence({ files }: { files?: EvidenceFile[] }) {
  const [view, setView] = useState<EvidenceFile | null>(null)
  if (!files?.length) return <p className="text-slate-400 text-sm">Sinh viên chưa đính kèm minh chứng.</p>
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {files.map((f, i) => f.data.startsWith('data:image/') ? (
          <button key={i} type="button" onClick={() => setView(f)} title={f.name} className="text-left">
            <img src={f.data} alt={f.name} className="w-full h-32 object-cover rounded-lg border border-slate-200 hover:opacity-90" />
            <div className="text-xs text-slate-500 mt-1 truncate">{f.name}</div>
          </button>
        ) : (
          <button key={i} type="button" onClick={() => openPdf(f)} className="flex items-center gap-2 bg-slate-50 px-3 py-3 rounded-lg text-sm text-slate-700 hover:bg-slate-100">
            📄 <span className="truncate">{f.name}</span>
          </button>
        ))}
      </div>
      {view && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setView(null)}>
          <img src={view.data} alt={view.name} className="max-w-full max-h-full rounded-lg" />
          <button className="absolute top-4 right-5 text-white text-3xl leading-none" aria-label="Đóng">&times;</button>
        </div>
      )}
    </>
  )
}
