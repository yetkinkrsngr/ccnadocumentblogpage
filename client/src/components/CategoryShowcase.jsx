import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

const categoryIcons = {
    'ip-adresleme': (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
    ),
    'subnetting': (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
    ),
    'routing': (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    'switching': (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
    ),
    'guvenlik': (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    )
}

const categoryColors = {
    'ip-adresleme': 'from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30',
    'subnetting': 'from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30',
    'routing': 'from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30',
    'switching': 'from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30',
    'guvenlik': 'from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30'
}

export default function CategoryShowcase() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/categories')
            .then(res => setCategories(res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <section className="container-custom py-16">
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton h-40 rounded-xl"></div>
                    ))}
                </div>
            </section>
        )
    }

    return (
        <section className="container-custom py-16">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2">CCNA Kategorileri</h2>
                <p className="text-[hsl(var(--color-text-secondary))]">
                    İlgilendiğiniz konuya göre içerikleri keşfedin
                </p>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category, index) => {
                    const icon = categoryIcons[category.slug] || categoryIcons['ip-adresleme']
                    const colorClass = categoryColors[category.slug] || categoryColors['ip-adresleme']

                    return (
                        <Link
                            key={category.id}
                            to={`/kategoriler/${category.slug}`}
                            className={`group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br ${colorClass} border border-[hsl(var(--color-border))] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-5">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}></div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                                {/* Icon */}
                                <div className="mb-4 text-[hsl(var(--color-primary))] group-hover:scale-110 transition-transform duration-300">
                                    {icon}
                                </div>

                                {/* Category Name */}
                                <h3 className="text-xl font-bold mb-2 text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary))] transition-colors">
                                    {category.name}
                                </h3>

                                {/* Arrow */}
                                <div className="flex items-center gap-2 text-sm text-[hsl(var(--color-text-secondary))] group-hover:text-[hsl(var(--color-primary))] transition-colors">
                                    <span>İçerikleri Gör</span>
                                    <svg
                                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/10 transition-all duration-300 pointer-events-none"></div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
