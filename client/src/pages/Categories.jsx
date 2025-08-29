import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import PostCard from '../components/PostCard'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [posts, setPosts] = useState([])
  const [selected, setSelected] = useState('')
  const [params, setParams] = useSearchParams()

  useEffect(() => {
    document.title = 'Kategoriler - CCNA Blog'
  }, [])

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data))
  }, [])

  useEffect(() => {
    const sec = params.get('sec') || ''
    setSelected(sec)
    const url = sec ? `/posts?categorySlug=${sec}` : '/posts'
    api.get(url).then(res => setPosts(res.data.items))
  }, [params])

  return (
    <div className="grid md:grid-cols-4 gap-6">
      <aside className="md:col-span-1">
        <ul className="bg-white rounded-xl shadow-soft p-4 space-y-2">
          <li>
            <button onClick={()=>setParams({})} className={`w-full text-left px-3 py-2 rounded ${!selected?'bg-blue-50 text-blue-700':''}`}>Tümü</button>
          </li>
          {categories.map(c => (
            <li key={c.id}>
              <button onClick={()=>setParams({sec: c.slug})} className={`w-full text-left px-3 py-2 rounded ${selected===c.slug?'bg-blue-50 text-blue-700':''}`}>{c.name}</button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="md:col-span-3">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      </section>
    </div>
  )
}

