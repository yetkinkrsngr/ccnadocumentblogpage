import { useEffect, useMemo, useState, useRef } from 'react'
import { api } from '../api'
import { useToast } from './ToastContext'

export default function MediaPicker({ open, onClose, onSelect }) {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()
  const { addToast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/media/list?page=1&pageSize=200')
      setItems(res.data.items)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) load()
  }, [open])

  const upload = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const fd = new FormData()
    fd.append('file', f)
    try {
      setLoading(true)
      const res = await api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      addToast('Dosya yüklendi.', 'success')
      await load()
      // Optional: Auto-select the uploaded file?
      // onSelect({ url: res.data.url, path: res.data.path })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Yükleme sırasında hata.'
      addToast(msg, 'error', 5000)
    } finally {
      if (fileRef.current) fileRef.current.value = ''
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(i => i.path.toLowerCase().includes(q))
  }, [items, query])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-slate-700 flex items-center gap-3 shrink-0">
          <h3 className="font-semibold text-lg dark:text-white">Medya Galerisi</h3>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ara..." className="ml-auto border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm w-64" />

          <div className="relative">
            <input ref={fileRef} type="file" onChange={upload} accept="image/*" className="hidden" id="picker-upload" />
            <label htmlFor="picker-upload" className="cursor-pointer px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
              Yükle
            </label>
          </div>

          <button onClick={onClose} className="px-3 py-2 border dark:border-slate-600 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">Kapat</button>
        </div>
        <div className="p-4 overflow-auto flex-1">
          {loading ? (
            <div className="text-center py-10 dark:text-white">Yükleniyor...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filtered.map(it => (
                <button key={it.path} onClick={() => onSelect(it)} className="bg-white dark:bg-slate-700 text-left rounded-xl shadow-soft p-2 text-xs hover:shadow-md transition-shadow group">
                  <div className="aspect-square overflow-hidden rounded mb-2 bg-gray-50 dark:bg-slate-900 relative">
                    <img src={it.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  </div>
                  <div className="truncate dark:text-gray-300" title={it.path}>{it.path}</div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-sm text-gray-600 dark:text-gray-400 text-center py-10">Sonuç bulunamadı.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
