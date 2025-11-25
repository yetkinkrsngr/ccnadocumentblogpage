import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import PostCard from '../components/PostCard'
import SkeletonCard from '../components/SkeletonCard'

export default function Search() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') || ''

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('rank')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState(q)
  const [recentSearches, setRecentSearches] = useState([])

  const pageSize = 12

  // Load categories
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(() => { })
  }, [])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch {
        setRecentSearches([])
      }
    }
  }, [])

  // Search
  useEffect(() => {
    if (!q) {
      setItems([])
      setTotal(0)
      return
    }

    setLoading(true)
    const url = `/posts/search?q=${encodeURIComponent(q)}&sort=${sort}&page=${page}&pageSize=${pageSize}` +
      (category ? `&categorySlug=${encodeURIComponent(category)}` : '')

    api.get(url)
      .then(res => {
        setItems(res.data.items)
        setTotal(res.data.total)

        // Save to recent searches
        saveRecentSearch(q)
      })
      .catch(() => {
        setItems([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [q, sort, page, category])

  const saveRecentSearch = (query) => {
    if (!query || query.length < 2) return

    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      navigate(`/ara?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  const handleRecentSearchClick = (query) => {
    setSearchInput(query)
    navigate(`/ara?q=${encodeURIComponent(query)}`)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const maxPage = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="min-h-screen">
      <div className="container-custom py-8 md:py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[hsl(var(--color-text))]">
            Arama
          </h1>
          <p className="text-[hsl(var(--color-text-secondary))]">
            CCNA eğitim içeriklerinde arama yapın
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input pr-12 text-lg"
              placeholder='Örn: "statik yönlendirme", VLAN, subnetting...'
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary h-10 px-4"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Search Tips */}
          <p className="mt-2 text-xs text-[hsl(var(--color-text-tertiary))]">
            💡 İpucu: Birden fazla kelime için tırnak kullanın ("statik yönlendirme"), joker karakter için * kullanın (VLAN*)
          </p>
        </form>

        {/* Recent Searches */}
        {!q && recentSearches.length > 0 && (
          <div className="mb-8 card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[hsl(var(--color-text))]">
                Son Aramalar
              </h2>
              <button
                onClick={clearRecentSearches}
                className="text-sm text-[hsl(var(--color-text-tertiary))] hover:text-[hsl(var(--color-text))] transition-colors"
              >
                Temizle
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="px-3 py-1.5 rounded-lg bg-[hsl(var(--color-bg-secondary))] hover:bg-[hsl(var(--color-bg-tertiary))] text-sm text-[hsl(var(--color-text))] transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-[hsl(var(--color-text-tertiary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters & Results Count */}
        {q && (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              {/* Results Count */}
              <div className="text-sm text-[hsl(var(--color-text-secondary))]">
                {loading ? (
                  <span>Aranıyor...</span>
                ) : (
                  <span>
                    <strong className="text-[hsl(var(--color-text))]">{total}</strong> sonuç bulundu
                    {category && ` (${categories.find(c => c.slug === category)?.name} kategorisinde)`}
                  </span>
                )}
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setPage(1) }}
                    className="input pr-8 text-sm appearance-none cursor-pointer"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--color-text-tertiary))] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1) }}
                    className="input pr-8 text-sm appearance-none cursor-pointer"
                  >
                    <option value="rank">En İlgili</option>
                    <option value="date">En Yeni</option>
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--color-text-tertiary))] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {q && (
          <>
            {loading ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: pageSize }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : items.length > 0 ? (
              <>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                  {items.map(p => <PostCard key={p.id} post={p} />)}
                </div>

                {/* Pagination */}
                {total > pageSize && (
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
              </>
            ) : (
              <div className="text-center py-16">
                <svg className="w-20 h-20 mx-auto mb-4 text-[hsl(var(--color-text-tertiary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h2 className="text-2xl font-bold mb-2 text-[hsl(var(--color-text))]">
                  Sonuç Bulunamadı
                </h2>
                <p className="text-[hsl(var(--color-text-secondary))] mb-6">
                  "<strong>{q}</strong>" için sonuç bulunamadı.
                  {category && ' Farklı bir kategori deneyin.'}
                </p>
                <button
                  onClick={() => {
                    setCategory('')
                    setPage(1)
                  }}
                  className="btn btn-secondary"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!q && recentSearches.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-20 h-20 mx-auto mb-4 text-[hsl(var(--color-text-tertiary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2 text-[hsl(var(--color-text))]">
              Arama Yapmaya Başlayın
            </h2>
            <p className="text-[hsl(var(--color-text-secondary))]">
              CCNA konularında arama yapmak için yukarıdaki arama kutusunu kullanın
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
