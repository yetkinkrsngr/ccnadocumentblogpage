import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { useToast } from '../components/ToastContext'

export default function Media(){
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const fileRef = useRef()
  const { addToast } = useToast()

  const load = async (p=1) => {
    const res = await api.get(`/media/list?page=${p}&pageSize=50`)
    setItems(res.data.items)
    setPage(p)
  }

  useEffect(()=>{ load(1) }, [])

  const upload = async (e) => {
    const f = e.target.files?.[0]
    if(!f) return
    const fd = new FormData()
    fd.append('file', f)
    try{
      const res = await api.post('/media/upload', fd, { headers: { 'Content-Type':'multipart/form-data' }})
      addToast('Dosya yüklendi.', 'success')
      await load(1)
      navigator.clipboard?.writeText(res.data.url)
    }catch(err){
      const msg = err?.response?.data?.message || 'Yükleme sırasında hata.'
      addToast(msg, 'error', 5000)
    }finally{
      if(fileRef.current) fileRef.current.value=''
    }
  }

  const del = async (path) => {
    if(!confirm('Dosyayı silmek istediğinize emin misiniz?')) return
    await api.delete(`/media?path=${encodeURIComponent(path)}`)
    addToast('Silindi.', 'success')
    await load(page)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Medya Yöneticisi</h1>
        <div>
          <input ref={fileRef} type="file" onChange={upload} accept="image/*" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map(it => (
          <div key={it.path} className="bg-white rounded-xl shadow-soft p-2 text-xs">
            <div className="aspect-square overflow-hidden rounded mb-2 bg-gray-50">
              <img src={it.url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="truncate" title={it.path}>{it.path}</div>
            <div className="flex gap-2 mt-2">
              <button className="px-2 py-1 rounded border" onClick={()=>navigator.clipboard?.writeText(it.url)}>Kopyala</button>
              <button className="px-2 py-1 rounded border text-red-600" onClick={()=>del(it.path)}>Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
