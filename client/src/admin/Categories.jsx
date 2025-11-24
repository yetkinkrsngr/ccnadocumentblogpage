import { useEffect, useState } from 'react'
import { api } from '../api'

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([])
  const [posts, setPosts] = useState([])
  const [name, setName] = useState('')

  const load = async () => {
    const res = await api.get('/categories')
    setCategories(res.data)

    // Get all posts to count per category
    const postsRes = await api.get('/posts?pageSize=1000')
    setPosts(postsRes.data.items || [])
  }

  useEffect(() => { load() }, [])

  const getPostCount = (categorySlug) => {
    return posts.filter(p => p.categorySlug === categorySlug).length
  }

  const create = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await api.post('/categories', { id: 0, name, slug: '' })
      setName('')
      await load()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Kategori eklenemedi.'
      alert(`Hata: ${msg}`)
    }
  }

  const update = async (c) => {
    const yeni = prompt('Yeni kategori adı:', c.name)
    if (!yeni) return
    try {
      await api.put(`/categories/${c.id}`, { id: c.id, name: yeni, slug: c.slug })
      await load()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Kategori güncellenemedi.'
      alert(`Hata: ${msg}`)
    }
  }

  const del = async (c) => {
    const postCount = getPostCount(c.slug)

    if (postCount > 0) {
      alert(`Bu kategoride ${postCount} yazı var. Önce bu yazıları silmeniz veya başka bir kategoriye taşımanız gerekiyor.`)
      return
    }

    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return
    try {
      await api.delete(`/categories/${c.id}`)
      await load()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Silme işlemi başarısız oldu.'
      alert(`Hata: ${msg}`)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Kategoriler</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm">
        <p className="font-semibold text-blue-900 mb-1">ℹ️ Önemli Bilgi</p>
        <p className="text-blue-800">İçinde yazı bulunan kategoriler silinemez. Önce yazıları silmeniz veya başka bir kategoriye taşımanız gerekir.</p>
      </div>

      <form onSubmit={create} className="bg-white p-4 rounded-xl shadow-soft flex gap-2 mb-4">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Yeni kategori adı"
        />
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Ekle</button>
      </form>

      <ul className="space-y-2">
        {categories.map(c => {
          const postCount = getPostCount(c.slug)
          const canDelete = postCount === 0

          return (
            <li key={c.id} className="bg-white rounded-xl shadow-soft p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-3 text-sm text-gray-500">
                    ({postCount} yazı)
                  </span>
                </div>
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => update(c)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => del(c)}
                    className={`px-3 py-1 rounded ${canDelete
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-gray-400 cursor-not-allowed'
                      }`}
                    disabled={!canDelete}
                    title={canDelete ? 'Sil' : `${postCount} yazı var, silinemez`}
                  >
                    Sil
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
