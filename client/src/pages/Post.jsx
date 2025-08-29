import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypePrism from 'rehype-prism-plus'
import rehypeSanitize from 'rehype-sanitize'
import 'prismjs/themes/prism.css'
import '../prism-cisco'
import { api } from '../api'

export default function Post(){
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get(`/posts/${slug}`).then(res => {
      setPost(res.data)
      setComments(res.data.comments)
      document.title = `${res.data.title} - CCNA Blog`
    })
  }, [slug])

  const submitComment = async (e) => {
    e.preventDefault()
    if(!post) return
    await api.post(`/comments/post/${post.id}`, { authorName, content })
    setAuthorName(''); setContent(''); setMessage('Yorumunuz alındı, onay sürecinde. Teşekkürler!')
  }

  if(!post) return <p>Yükleniyor...</p>

  return (
    <article className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">{post.title}</h1>
      <div className="text-sm text-gray-500 mb-6">{new Date(post.createdAt).toLocaleDateString('tr-TR')} • {post.author} • {post.categoryName}</div>

      <div className="prose max-w-none prose-headings:scroll-mt-24">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypePrism, rehypeSanitize]} components={{
          code({node, inline, className, children, ...props}){
            const match = /language-(\w+)/.exec(className || '')
            return (
              <code className={`rounded ${className || ''}`} {...props}>
                {children}
              </code>
            )
          }
        }}>
          {post.content}
        </ReactMarkdown>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Yorumlar</h2>
        <div className="space-y-4 mb-6">
          {comments.length === 0 && <p className="text-gray-500">Henüz onaylanmış yorum yok.</p>}
          {comments.map(c => (
            <div key={c.id} className="bg-white p-4 rounded-xl shadow-soft">
              <div className="text-sm text-gray-500 mb-1">{c.authorName} • {new Date(c.createdAt).toLocaleString('tr-TR')}</div>
              <p>{c.content}</p>
            </div>
          ))}
        </div>

        <form onSubmit={submitComment} className="bg-white p-4 rounded-xl shadow-soft space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Adınız (opsiyonel)</label>
            <input value={authorName} onChange={e=>setAuthorName(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Örn. Ahmet" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Yorumunuz</label>
            <textarea value={content} onChange={e=>setContent(e.target.value)} required rows={4} className="w-full border rounded-lg px-3 py-2" placeholder="Yapıcı geri bildiriminizi yazın..." />
            <p className="text-xs text-gray-500 mt-1">Basit küfür engelleme aktif; tüm yorumlar önce admin onayına gider.</p>
          </div>
          {message && <p className="text-green-600 text-sm">{message}</p>}
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Yorumu Gönder</button>
        </form>
      </section>
    </article>
  )
}

