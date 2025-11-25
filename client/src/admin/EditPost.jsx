import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

import { useToast } from '../components/ToastContext'
import MediaPicker from '../components/MediaPicker'

export default function EditPost() {
  const { id } = useParams()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ title: '', summary: '', content: '', categoryId: '', author: 'Admin', featuredImageUrl: '' })
  const [mediaOpen, setMediaOpen] = useState(false)
  const [pickingFor, setPickingFor] = useState('content') // 'content' or 'featured'
  const contentRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data))
    if (id) {
      api.get(`/posts/by-id/${id}`).then(res => {
        const d = res.data
        setForm({
          title: d.title,
          summary: d.summary,
          content: d.content,
          categoryId: d.categoryId,
          author: d.author,
          featuredImageUrl: d.featuredImageUrl || ''
        })
      })
    }
  }, [id])

  const { addToast } = useToast()

  const save = async (e) => {
    e.preventDefault()
    const payload = { ...form, categoryId: Number(form.categoryId) }
    try {
      if (id) {
        await api.put(`/posts/${id}`, payload)
        addToast('Yazı başarıyla güncellendi.', 'success')
      } else {
        await api.post('/posts', payload)
        addToast('Yazı başarıyla oluşturuldu.', 'success')
      }
      navigate('/admin/yazilar')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Kaydetme sırasında bir hata oluştu.'
      addToast(msg, 'error', 5000)
    }
  }

  const insertAtCursor = (text) => {
    const ta = contentRef.current
    if (!ta) { setForm(f => ({ ...f, content: (f.content || '') + text })); return }
    const start = ta.selectionStart ?? (form.content?.length || 0)
    const end = ta.selectionEnd ?? (form.content?.length || 0)
    const before = form.content.slice(0, start)
    const after = form.content.slice(end)
    const next = before + text + after
    setForm(f => ({ ...f, content: next }))
    // caret to after inserted
    setTimeout(() => {
      try {
        ta.focus()
        const pos = start + text.length
        ta.setSelectionRange(pos, pos)
      } catch { /* ignore */ }
    }, 0)
  }

  const openMediaPicker = (mode) => {
    setPickingFor(mode)
    setMediaOpen(true)
  }

  const onSelectMedia = (item) => {
    if (pickingFor === 'featured') {
      setForm(f => ({ ...f, featuredImageUrl: item.url }))
      addToast('Öne çıkan görsel seçildi.', 'success')
    } else {
      // Markdown image
      const md = `\n\n![görsel](${item.url})\n\n`
      insertAtCursor(md)
      addToast('Görsel içeriğe eklendi.', 'success')
    }
    setMediaOpen(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4 dark:text-white">{id ? 'Yazıyı Düzenle' : 'Yeni Yazı'}</h1>
      <form onSubmit={save} className="bg-white dark:bg-slate-800 rounded-xl shadow-soft p-6 space-y-6">

        {/* Featured Image Section */}
        <div className="border-b dark:border-slate-700 pb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Öne Çıkan Görsel</label>
          <div className="flex items-start gap-4">
            {form.featuredImageUrl ? (
              <div className="relative group w-48 aspect-video bg-gray-100 dark:bg-slate-900 rounded-lg overflow-hidden border dark:border-slate-700">
                <img src={form.featuredImageUrl} alt="Featured" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, featuredImageUrl: '' }))}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Kaldır"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ) : (
              <div className="w-48 aspect-video bg-gray-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                Görsel Yok
              </div>
            )}
            <button
              type="button"
              onClick={() => openMediaPicker('featured')}
              className="px-4 py-2 border dark:border-slate-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-white transition-colors"
            >
              {form.featuredImageUrl ? 'Görseli Değiştir' : 'Görsel Seç'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlık</label>
            <input id="title" className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
            <select id="category" className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required>
              <option value="">Seçiniz</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Özet</label>
          <textarea id="summary" className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2" rows={3} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} required />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yazar</label>
          <input id="author" className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">İçerik (Markdown)</label>
            <button type="button" onClick={() => openMediaPicker('content')} className="text-sm px-3 py-1 rounded border dark:border-slate-600 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              Medya Ekle
            </button>
          </div>
          <textarea id="content" ref={contentRef} className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 font-mono text-sm" rows={15} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cisco komut bloklarında dil etiketi olarak <code>```cisco</code> kullanın.</p>
        </div>

        <div className="flex gap-3 pt-4 border-t dark:border-slate-700">
          <button className="px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium">Kaydet</button>
          <button type="button" onClick={() => navigate('/admin/yazilar')} className="px-6 py-2 rounded-lg border dark:border-slate-600 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">İptal</button>
        </div>
      </form>
      <MediaPicker open={mediaOpen} onClose={() => setMediaOpen(false)} onSelect={onSelectMedia} />
    </div>
  )
}
