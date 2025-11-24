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
        <div className="bg-white rounded-xl shadow-soft p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Kategoriler</h2>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setParams({})}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${!selected
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                Tümü
              </button>
            </li>
            {categories.map(c => (
              <li key={c.id}>
                <button
                  onClick={() => setParams({ sec: c.slug })}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selected === c.slug
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <section className="md:col-span-3">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map(p => <PostCard key={p.id} post={p} />)}
        </div>
        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Bu kategoride henüz yazı bulunmuyor.
          </div>
        )}
      </section>
    </div>
  )
}

