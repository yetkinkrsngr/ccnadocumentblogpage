import { useEffect, useState } from 'react'

export default function TableOfContents({ content }) {
    const [headings, setHeadings] = useState([])
    const [activeId, setActiveId] = useState('')

    useEffect(() => {
        // Parse markdown headings
        const lines = content.split('\n')
        const toc = []

        lines.forEach((line, index) => {
            const h2Match = line.match(/^##\s+(.+)/)
            const h3Match = line.match(/^###\s+(.+)/)

            if (h2Match) {
                const text = h2Match[1].trim()
                const id = `heading-${index}`
                toc.push({ level: 2, text, id })
            } else if (h3Match) {
                const text = h3Match[1].trim()
                const id = `heading-${index}`
                toc.push({ level: 3, text, id })
            }
        })

        setHeadings(toc)
    }, [content])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            { rootMargin: '-80px 0px -80% 0px' }
        )

        // Observe all headings
        document.querySelectorAll('h2, h3').forEach((heading) => {
            observer.observe(heading)
        })

        return () => observer.disconnect()
    }, [headings])

    const scrollToHeading = (id) => {
        const element = document.getElementById(id)
        if (element) {
            const offset = 80
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - offset

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            })
        }
    }

    if (headings.length === 0) return null

    return (
        <nav className="sticky top-24 hidden lg:block">
            <div className="card p-6 max-w-xs">
                <h3 className="text-sm font-bold mb-4 text-[hsl(var(--color-text))] uppercase tracking-wide">
                    İçindekiler
                </h3>
                <ul className="space-y-2 text-sm">
                    {headings.map((heading) => (
                        <li key={heading.id}>
                            <button
                                onClick={() => scrollToHeading(heading.id)}
                                className={`text-left w-full transition-colors hover:text-[hsl(var(--color-primary))] ${heading.level === 3 ? 'pl-4' : ''
                                    } ${activeId === heading.id
                                        ? 'text-[hsl(var(--color-primary))] font-medium'
                                        : 'text-[hsl(var(--color-text-secondary))]'
                                    }`}
                            >
                                {heading.text}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    )
}
