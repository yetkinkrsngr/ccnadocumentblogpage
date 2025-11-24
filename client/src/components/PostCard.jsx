import { Link } from 'react-router-dom'

export default function PostCard({ post }) {
  return (
    <article className="group relative card card-hover p-6 flex flex-col h-full">
      {/* Category Badge */}
      <Link
        to={`/kategoriler?sec=${post.categorySlug}`}
        className="relative z-10 mb-3 inline-flex self-start"
      >
        <span className="badge badge-primary text-xs font-semibold px-3 py-1">
          {post.categoryName}
        </span>
      </Link>

      {/* Content */}
      <div className="flex-1">
        <Link to={`/yazi/${post.slug}`} className="block before:absolute before:inset-0">
          <h3 className="text-xl font-bold tracking-tight mb-3 line-clamp-2 group-hover:text-[hsl(var(--color-primary))] transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="text-sm text-[hsl(var(--color-text-secondary))] line-clamp-3 leading-relaxed">
          {post.summary}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-[hsl(var(--color-border))] flex items-center justify-between text-xs text-[hsl(var(--color-text-tertiary))]">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <time dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </div>

        {post.author && (
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{post.author}</span>
          </div>
        )}
      </div>

      {/* Gradient Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl"></div>
    </article>
  )
}

