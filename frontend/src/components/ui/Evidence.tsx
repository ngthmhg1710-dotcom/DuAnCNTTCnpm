import type { EvidenceFile } from '../../lib/api'

export default function Evidence({ files }: { files?: EvidenceFile[] }) {
  if (!files?.length) return <p className="text-slate-400 text-sm">Sinh viên chưa đính kèm minh chứng.</p>
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {files.map((f, i) => f.data.startsWith('data:image/') ? (
        <a key={i} href={f.data} target="_blank" rel="noreferrer" title={f.name}>
          <img src={f.data} alt={f.name} className="w-full h-32 object-cover rounded-lg border border-slate-200" />
          <div className="text-xs text-slate-500 mt-1 truncate">{f.name}</div>
        </a>
      ) : (
        <a key={i} href={f.data} download={f.name} className="flex items-center gap-2 bg-slate-50 px-3 py-3 rounded-lg text-sm text-slate-700 hover:bg-slate-100">
          📄 <span className="truncate">{f.name}</span>
        </a>
      ))}
    </div>
  )
}
