import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function FeaturedPosts() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        api.get('/posts/featured?count=6')
            .then(res => setPosts(res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (posts.length === 0) return
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % posts.length)
        }, 5000) // Auto-slide every 5 seconds
        return () => clearInterval(interval)
    }, [posts.length])

    const goToSlide = (index) => {
        setCurrentIndex(index)
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % posts.length)
    }

    if (loading) {
        return (
            <section className="container-custom py-16">
                <div className="skeleton h-96 rounded-2xl"></div>
            </section>
        )
    }

    if (posts.length === 0) return null

    const currentPost = posts[currentIndex]

    return (
        <section className="container-custom py-16">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Öne Çıkan İçerikler</h2>
                <p className="text-[hsl(var(--color-text-secondary))]">
                    En son eklenen CCNA eğitim yazılarımız
                </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-[hsl(var(--color-border))]">
                {/* Main Slide */}
                <div className="relative h-96 md:h-[28rem]">
                    <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                        <div className="max-w-3xl animate-fade-in" key={currentIndex}>
                            {/* Category Badge */}
                            <Link
                                to={`/kategoriler/${currentPost.categorySlug}`}
                                className="inline-block mb-4"
                            >
                                <span className="badge badge-primary text-sm px-3 py-1">
                                    {currentPost.categoryName}
                                </span>
                            </Link>

                            {/* Title */}
                            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-[hsl(var(--color-text))]">
                                {currentPost.title}
                            </h3>

                            {/* Summary */}
                            <p className="text-base md:text-lg text-[hsl(var(--color-text-secondary))] mb-6 line-clamp-2">
                                {currentPost.summary}
                            </p>

                            {/* Date & CTA */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-[hsl(var(--color-text-tertiary))]">
                                    {new Date(currentPost.createdAt).toLocaleDateString('tr-TR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                                <Link
                                    to={`/yazi/${currentPost.slug}`}
                                    className="btn btn-primary"
                                >
                                    Yazıyı Oku
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 btn btn-secondary w-10 h-10 p-0 rounded-full opacity-80 hover:opacity-100 transition-opacity"
                        aria-label="Önceki"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-secondary w-10 h-10 p-0 rounded-full opacity-80 hover:opacity-100 transition-opacity"
                        aria-label="Sonraki"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {posts.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'bg-[hsl(var(--color-primary))] w-8'
                                    : 'bg-[hsl(var(--color-text-tertiary))] hover:bg-[hsl(var(--color-text-secondary))]'
                                }`}
                            aria-label={`Slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
