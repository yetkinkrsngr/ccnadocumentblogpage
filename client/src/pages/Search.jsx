import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import PostCard from '../components/PostCard'

export default function Search(){
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('rank')
  const [page, setPage] = useState(1)
  const pageSize = 12

  useEffect(()=>{ api.get('/categories').then(res => setCategories(res.data)) }, [])

  useEffect(()=>{
    if(!q) { setItems([]); return }
    const url = `/posts/search?q=${encodeURIComponent(q)}&sort=${sort}&page=${page}&pageSize=${pageSize}` + (category? `&categorySlug=${encodeURIComponent(category)}`:'')
    api.get(url).then(res => setItems(res.data.items))
  }, [q, sort, page, category])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Arama</h1>
        <div className="flex gap-2 items-center text-sm">
          <select value={category} onChange={e=>{setCategory(e.target.value); setPage(1)}} className="border rounded px-2 py-1">
            <option value="">Tüm kategoriler</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={sort} onChange={e=>{setSort(e.target.value); setPage(1)}} className="border rounded px-2 py-1">
            <option value="rank">Alaka</option>
            <option value="date">Tarih</option>
          </select>
        </div>
      </div>
      <form action="/ara" className="mb-4">
        <input name="q" defaultValue={q} className="w-full border rounded-lg px-3 py-2" placeholder={'Örn: "statik yönlendirme" OR VLAN*'} />
      </form>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(p => <PostCard key={p.id} post={p} />)}
      </div>
      <div className="flex items-center gap-2 justify-center mt-6 text-sm">
        <button disabled={page<=1} className="px-3 py-1 rounded border disabled:opacity-50" onClick={()=>setPage(p=>Math.max(1,p-1))}>Önceki</button>
        <span className="text-gray-500">Sayfa {page}</span>
        <button className="px-3 py-1 rounded border" onClick={()=>setPage(p=>p+1)}>Sonraki</button>
      </div>
    </div>
  )
}
