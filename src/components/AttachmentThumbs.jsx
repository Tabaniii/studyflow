import { useEffect, useState } from 'react'
import { signedAttachmentUrl } from '../lib/attachments'

export default function AttachmentThumbs({ attachments = [], onDelete }) {
  const [urls, setUrls] = useState({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      const next = {}
      for (const item of attachments) {
        try {
          next[item.id] = await signedAttachmentUrl(item.storage_path)
        } catch {
          next[item.id] = null
        }
      }
      if (!cancelled) setUrls(next)
    }
    if (attachments.length > 0) load()
    else setUrls({})
    return () => {
      cancelled = true
    }
  }, [attachments])

  if (!attachments.length) return null

  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {attachments.map((item) => {
        const url = urls[item.id]
        const isImage = String(item.mime_type || '').startsWith('image/')
        return (
          <li key={item.id} className="relative">
            <a
              href={url || '#'}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
              title={item.file_name}
            >
              {isImage && url ? (
                <img src={url} alt={item.file_name} className="h-16 w-16 object-cover" />
              ) : (
                <span className="flex h-16 w-24 items-center justify-center px-2 text-center text-[10px] font-medium text-slate-600">
                  {item.file_name}
                </span>
              )}
            </a>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(item)}
                className="absolute -right-1 -top-1 rounded-full bg-white px-1.5 text-xs font-bold text-red-600 shadow"
                aria-label={`Hapus ${item.file_name}`}
              >
                ×
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
