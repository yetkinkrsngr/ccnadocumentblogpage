import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import PostCard from '../components/PostCard'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 9

  useEffect(() => {
    document.title = 'CCNA Blog - Ana Sayfa'
  }, [])

  useEffect(() => {
    api.get(`/posts?page=${page}&pageSize=${pageSize}`)
      .then(res => { setPosts(res.data.items); setTotal(res.data.total) })
      .catch(() => {})
  }, [page])

  const maxPage = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">CCNA Öğrenme Merkezi</h1>
        <p className="text-gray-600">IP Adresleme, Subnetting, Routing, Switching ve Güvenlik üzerine Türkçe içerikler.</p>
      </section>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map(p => <PostCard key={p.id} post={p} />)}
      </div>

      <div className="flex items-center gap-2 justify-center mt-8">
        <button disabled={page<=1} className="px-3 py-1 rounded border disabled:opacity-50" onClick={()=>setPage(p=>Math.max(1,p-1))}>Önceki</button>
        <span className="text-sm text-gray-500">Sayfa {page} / {maxPage}</span>
        <button disabled={page>=maxPage} className="px-3 py-1 rounded border disabled:opacity-50" onClick={()=>setPage(p=>Math.min(maxPage,p+1))}>Sonraki</button>
      </div>
    </div>
  )
}

