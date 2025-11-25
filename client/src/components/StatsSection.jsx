import { useEffect, useState } from 'react'
import { api } from '../api'

export default function StatsSection() {
    const [stats, setStats] = useState({
        totalPosts: 0,
        totalCategories: 0,
        totalComments: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/posts/stats')
            .then(res => setStats(res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const statItems = [
        {
            label: 'Eğitim İçeriği',
            value: stats.totalPosts,
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            color: 'from-blue-500 to-blue-600'
        },
        {
            label: 'Ana Kategori',
            value: stats.totalCategories,
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
            ),
            color: 'from-purple-500 to-purple-600'
        },
        {
            label: 'Toplam Yorum',
            value: stats.totalComments,
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            color: 'from-pink-500 to-pink-600'
        },
        {
            label: 'Ücretsiz Erişim',
            value: '100%',
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'from-green-500 to-green-600'
        }
    ]

    if (loading) {
        return (
            <section className="container-custom py-16">
                <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="skeleton h-32 rounded-xl"></div>
                    ))}
                </div>
            </section>
        )
    }

    return (
        <section className="container-custom py-16">
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                {statItems.map((item, index) => (
                    <div
                        key={index}
                        className="group relative overflow-hidden rounded-xl p-6 bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-border-hover))] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-scale-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Icon */}
                            <div className={`mb-3 text-transparent bg-gradient-to-br ${item.color} bg-clip-text group-hover:scale-110 transition-transform duration-300`}>
                                {item.icon}
                            </div>

                            {/* Value */}
                            <div className={`text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-br ${item.color} bg-clip-text text-transparent`}>
                                {typeof item.value === 'number' ? `${item.value}+` : item.value}
                            </div>

                            {/* Label */}
                            <div className="text-sm text-[hsl(var(--color-text-tertiary))]">
                                {item.label}
                            </div>
                        </div>

                        {/* Decorative Circle */}
                        <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    </div>
                ))}
            </div>
        </section>
    )
}
