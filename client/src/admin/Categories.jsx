import { useEffect, useState } from 'react'
import { api } from '../api'

export default function CategoriesAdmin(){
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')

  const load = async () => {
    const res = await api.get('/categories')
    setCategories(res.data)
  }

  useEffect(()=>{ load() }, [])

  const create = async (e) => {
    e.preventDefault()
    if(!name.trim()) return
    await api.post('/categories', { id:0, name, slug:'' })
    setName('')
    await load()
  }

  const update = async (c) => {
    const yeni = prompt('Yeni kategori adı:', c.name)
    if(!yeni) return
    await api.put(`/categories/${c.id}`, { id:c.id, name:yeni, slug:c.slug })
    await load()
  }

  const del = async (c) => {
    if(!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return
    await api.delete(`/categories/${c.id}`)
    await load()
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Kategoriler</h1>
      <form onSubmit={create} className="bg-white p-4 rounded-xl shadow-soft flex gap-2 mb-4">
        <input value={name} onChange={e=>setName(e.target.value)} className="flex-1 border rounded-lg px-3 py-2" placeholder="Yeni kategori adı" />
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">Ekle</button>
      </form>
      <ul className="space-y-2">
        {categories.map(c => (
          <li key={c.id} className="bg-white rounded-xl shadow-soft p-3 flex items-center justify-between">
            <span>{c.name}</span>
            <div className="text-sm">
              <button onClick={()=>update(c)} className="text-blue-600 mr-3">Düzenle</button>
              <button onClick={()=>del(c)} className="text-red-600">Sil</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

