export default function AuthorCard({ author, date }) {
    // Generate avatar from initials
    const getInitials = (name) => {
        if (!name) return 'A'
        const parts = name.split(' ')
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase()
        }
        return name.substring(0, 2).toUpperCase()
    }

    // Generate color from name
    const getColorFromName = (name) => {
        if (!name) return 'from-blue-500 to-purple-500'
        const colors = [
            'from-blue-500 to-purple-500',
            'from-purple-500 to-pink-500',
            'from-pink-500 to-red-500',
            'from-green-500 to-teal-500',
            'from-orange-500 to-red-500',
            'from-indigo-500 to-blue-500'
        ]
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        return colors[hash % colors.length]
    }

    const initials = getInitials(author)
    const colorClass = getColorFromName(author)

    return (
        <div className="card p-6">
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {initials}
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[hsl(var(--color-text))]">{author || 'Anonim Yazar'}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            Yazar
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[hsl(var(--color-text-secondary))]">
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(date).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio (optional - can be added later) */}
            <p className="mt-4 text-sm text-[hsl(var(--color-text-secondary))] leading-relaxed">
                CCNA eğitim içerikleri hazırlayan deneyimli bir ağ uzmanı. Cisco teknolojileri ve ağ güvenliği konularında uzmanlaşmıştır.
            </p>
        </div>
    )
}
