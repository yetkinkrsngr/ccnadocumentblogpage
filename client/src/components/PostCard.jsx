import { Link } from 'react-router-dom'

export default function PostCard({ post }) {
  return (
    <article className="bg-white rounded-xl shadow-soft card-hover p-5 flex flex-col">
      <div className="flex-1">
        <Link to={`/yazi/${post.slug}`} className="block">
          <h3 className="text-lg font-semibold tracking-tight mb-2 line-clamp-2">{post.title}</h3>
        </Link>
        <p className="text-sm text-gray-600 line-clamp-3">{post.summary}</p>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <Link to={`/kategoriler?sec=${post.categorySlug}`} className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100">{post.categoryName}</Link>
        <span>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
      </div>
    </article>
  )
}

