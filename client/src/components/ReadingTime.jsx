export function calculateReadingTime(content) {
    // Average reading speed: 200 words per minute
    const wordsPerMinute = 200

    // Remove markdown syntax and count words
    const text = content
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`[^`]*`/g, '') // Remove inline code
        .replace(/[#*_~\[\]()]/g, '') // Remove markdown symbols
        .trim()

    const words = text.split(/\s+/).filter(word => word.length > 0).length
    const minutes = Math.ceil(words / wordsPerMinute)

    return minutes
}

export default function ReadingTime({ content }) {
    const minutes = calculateReadingTime(content)

    return (
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--color-text-secondary))]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{minutes} dk okuma</span>
        </div>
    )
}
