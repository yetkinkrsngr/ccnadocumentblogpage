import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'

export default function MediaPicker({ open, onClose, onSelect }){
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if(!open) return
    setLoading(true)
    api.get('/media/list?page=1&pageSize=200').then(res => setItems(res.data.items)).finally(()=>setLoading(false))
  }, [open])

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase()
    if(!q) return items
    return items.filter(i => i.path.toLowerCase().includes(q))
  }, [items, query])

  if(!open) return null
  return (
    <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-soft w-full max-w-5xl max-h-[85vh] overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="p-4 border-b flex items-center gap-3">
          <h3 className="font-semibold text-lg">Medya Galerisi</h3>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ara..." className="ml-auto border rounded-lg px-3 py-2 text-sm w-64" />
          <button onClick={onClose} className="px-3 py-2 border rounded-lg">Kapat</button>
        </div>
        <div className="p-4 overflow-auto">
          {loading ? (
            <div>Yükleniyor...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filtered.map(it => (
                <button key={it.path} onClick={()=>onSelect(it)} className="bg-white text-left rounded-xl shadow-soft p-2 text-xs hover:shadow-md">
                  <div className="aspect-square overflow-hidden rounded mb-2 bg-gray-50">
                    <img src={it.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="truncate" title={it.path}>{it.path}</div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-sm text-gray-600">Sonuç bulunamadı.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
