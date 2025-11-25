import { useEffect, useState } from 'react'
import { api } from '../api'
import PostCard from '../components/PostCard'
import Hero from '../components/Hero'
import SkeletonCard from '../components/SkeletonCard'
import FeaturedPosts from '../components/FeaturedPosts'
import CategoryShowcase from '../components/CategoryShowcase'
import StatsSection from '../components/StatsSection'
import Newsletter from '../components/Newsletter'

import SEO from '../components/SEO'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const pageSize = 9

  useEffect(() => {
    setLoading(true)
    api.get(`/posts?page=${page}&pageSize=${pageSize}`)
      .then(res => {
        setPosts(res.data.items)
        setTotal(res.data.total)
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [page])

  const maxPage = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="min-h-screen">
      <SEO
        title="Türkçe Ağ Eğitimi"
        description="IP Adresleme, Subnetting, Routing, Switching ve Güvenlik konularında kapsamlı Türkçe CCNA eğitim içerikleri."
        canonical="/"
      />
      {/* Hero Section */}
      <Hero />

      {/* Featured Posts Carousel */}
      <FeaturedPosts />

      {/* Stats Section */}
      <StatsSection />

      {/* Category Showcase */}
      <CategoryShowcase />

      {/* Latest Posts Section */}
      <section className="container-custom py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Tüm Yazılar</h2>
            <p className="text-[hsl(var(--color-text-secondary))]">
              CCNA eğitim içeriklerimize göz atın
            </p>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {loading ? (
            // Skeleton Loaders
            Array.from({ length: pageSize }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : posts.length > 0 ? (
            posts.map(p => <PostCard key={p.id} post={p} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-[hsl(var(--color-text-tertiary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-[hsl(var(--color-text-secondary))]">Henüz içerik bulunmuyor</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && posts.length > 0 && (
          <div className="flex items-center gap-3 justify-center">
            <button
              disabled={page <= 1}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Önceki
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[hsl(var(--color-text))]">
                Sayfa {page}
              </span>
              <span className="text-sm text-[hsl(var(--color-text-tertiary))]">
                / {maxPage}
              </span>
            </div>

            <button
              disabled={page >= maxPage}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage(p => Math.min(maxPage, p + 1))}
            >
              Sonraki
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  )
}

