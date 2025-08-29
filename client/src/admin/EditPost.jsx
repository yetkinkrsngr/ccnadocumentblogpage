import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

import { useToast } from '../components/ToastContext'
import MediaPicker from '../components/MediaPicker'

export default function EditPost(){
  const { id } = useParams()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ title:'', summary:'', content:'', categoryId:'', author:'Admin' })
  const [mediaOpen, setMediaOpen] = useState(false)
  const contentRef = useRef(null)
  const navigate = useNavigate()

  useEffect(()=>{
    api.get('/categories').then(res => setCategories(res.data))
    if(id){
      api.get(`/posts/by-id/${id}`).then(res => {
        const d = res.data
        setForm({ title:d.title, summary:d.summary, content:d.content, categoryId: d.categoryId, author:d.author })
      })
    }
  }, [id])

  const { addToast } = useToast()

  const save = async (e) => {
    e.preventDefault()
    const payload = { ...form, categoryId: Number(form.categoryId) }
    try{
      if(id){
        await api.put(`/posts/${id}`, payload)
        addToast('Yazı başarıyla güncellendi.', 'success')
      }else{
        await api.post('/posts', payload)
        addToast('Yazı başarıyla oluşturuldu.', 'success')
      }
      navigate('/admin/yazilar')
    }catch(err){
      const msg = err?.response?.data?.message || 'Kaydetme sırasında bir hata oluştu.'
      addToast(msg, 'error', 5000)
    }
  }

  const insertAtCursor = (text) => {
    const ta = contentRef.current
    if(!ta){ setForm(f=>({...f, content: (f.content||'') + text })); return }
    const start = ta.selectionStart ?? (form.content?.length || 0)
    const end = ta.selectionEnd ?? (form.content?.length || 0)
    const before = form.content.slice(0, start)
    const after = form.content.slice(end)
    const next = before + text + after
    setForm(f=>({...f, content: next }))
    // caret to after inserted
    setTimeout(()=>{
      try{
        ta.focus()
        const pos = start + text.length
        ta.setSelectionRange(pos, pos)
      }catch{}
    },0)
  }

  const onSelectMedia = (item) => {
    // Markdown image
    const md = `\n\n![görsel](${item.url})\n\n`
    insertAtCursor(md)
    setMediaOpen(false)
    addToast('Görsel eklendi.', 'success')
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">{id? 'Yazıyı Düzenle' : 'Yeni Yazı'}</h1>
      <form onSubmit={save} className="bg-white rounded-xl shadow-soft p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Başlık</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Özet</label>
          <textarea className="w-full border rounded-lg px-3 py-2" rows={2} value={form.summary} onChange={e=>setForm(f=>({...f, summary:e.target.value}))} required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Kategori</label>
          <select className="w-full border rounded-lg px-3 py-2" value={form.categoryId} onChange={e=>setForm(f=>({...f, categoryId:e.target.value}))} required>
            <option value="">Seçiniz</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Yazar</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.author} onChange={e=>setForm(f=>({...f, author:e.target.value}))} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm text-gray-600 mb-1">İçerik (Markdown)</label>
            <button type="button" onClick={()=>setMediaOpen(true)} className="text-sm px-3 py-1 rounded border">Medya Ekle</button>
          </div>
          <textarea ref={contentRef} className="w-full border rounded-lg px-3 py-2 font-mono" rows={12} value={form.content} onChange={e=>setForm(f=>({...f, content:e.target.value}))} required />
          <p className="text-xs text-gray-500 mt-1">Cisco komut bloklarında dil etiketi olarak <code>```cisco</code> kullanın.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">Kaydet</button>
          <button type="button" onClick={()=>navigate('/admin/yazilar')} className="px-4 py-2 rounded-lg border">İptal</button>
        </div>
      </form>
      <MediaPicker open={mediaOpen} onClose={()=>setMediaOpen(false)} onSelect={onSelectMedia} />
    </div>
  )
}
