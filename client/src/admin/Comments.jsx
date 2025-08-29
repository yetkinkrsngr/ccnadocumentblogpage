import { useEffect, useState } from 'react'
import { api } from '../api'

export default function CommentsAdmin(){
  const [comments, setComments] = useState([])
  const [onlyPending, setOnlyPending] = useState(true)

  const load = async () => {
    const res = await api.get(`/comments?onlyPending=${onlyPending}`)
    setComments(res.data)
  }

  useEffect(()=>{ load() }, [onlyPending])

  const approve = async (id) => {
    await api.put(`/comments/${id}/approve`)
    await load()
  }

  const del = async (id) => {
    if(!confirm('Yorumu silmek istediğinize emin misiniz?')) return
    await api.delete(`/comments/${id}`)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Yorumlar</h1>
        <label className="text-sm text-gray-600 flex items-center gap-2">
          <input type="checkbox" checked={onlyPending} onChange={e=>setOnlyPending(e.target.checked)} /> Sadece bekleyenler
        </label>
      </div>
      <div className="space-y-3">
        {comments.map(c => (
          <div key={c.id} className="bg-white rounded-xl shadow-soft p-4">
            <div className="text-sm text-gray-500 mb-1">{c.authorName} • {new Date(c.createdAt).toLocaleString('tr-TR')} • {c.postTitle}</div>
            <p className="mb-3">{c.content}</p>
            <div className="text-sm">
              {!c.approved && <button onClick={()=>approve(c.id)} className="text-green-700 mr-3">Onayla</button>}
              <button onClick={()=>del(c.id)} className="text-red-600">Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

