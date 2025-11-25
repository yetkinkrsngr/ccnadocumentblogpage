import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function RelatedPosts({ currentSlug }) {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!currentSlug) return

        api.get(`/posts/${currentSlug}/related?count=3`)
            .then(res => setPosts(res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [currentSlug])

    if (loading) {
        return (
            <section className="mt-16">
                <h2 className="text-2xl font-bold mb-6">İlgili Yazılar</h2>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton h-48 rounded-xl"></div>
                    ))}
                </div>
            </section>
        )
    }

    if (posts.length === 0) return null

    return (
        <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-[hsl(var(--color-text))]">İlgili Yazılar</h2>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        to={`/yazi/${post.slug}`}
                        className="group card card-hover p-6"
                    >
                        {/* Category Badge */}
                        <div className="mb-3">
                            <span className="badge badge-primary text-xs">
                                {post.categoryName}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold mb-2 text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary))] transition-colors line-clamp-2">
                            {post.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-sm text-[hsl(var(--color-text-secondary))] mb-4 line-clamp-3">
                            {post.summary}
                        </p>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-xs text-[hsl(var(--color-text-tertiary))]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>

                        {/* Arrow */}
                        <div className="mt-4 flex items-center gap-2 text-sm text-[hsl(var(--color-primary))] opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Devamını Oku</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
