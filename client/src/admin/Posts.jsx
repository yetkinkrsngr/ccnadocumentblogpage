import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

import { useToast } from '../components/ToastContext'

export default function Posts(){
  const [posts, setPosts] = useState([])

  const load = async () => {
    const res = await api.get('/posts?page=1&pageSize=100')
    setPosts(res.data.items)
  }

  useEffect(()=>{ load() }, [])

  const { addToast } = useToast()

  const del = async (id) => {
    if(!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return
    try{
      await api.delete(`/posts/${id}`)
      addToast('Yazı silindi.', 'success')
      await load()
    }catch(err){
      const msg = err?.response?.data?.message || 'Silme sırasında bir hata oluştu.'
      addToast(msg, 'error', 5000)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Yazılar</h1>
        <Link to="/admin/yazilar/yeni" className="px-3 py-2 rounded-lg bg-blue-600 text-white">Yeni Yazı</Link>
      </div>
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Başlık</th>
              <th className="text-left p-3">Kategori</th>
              <th className="text-left p-3">Tarih</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.title}</td>
                <td className="p-3 text-gray-600">{p.categoryName}</td>
                <td className="p-3 text-gray-600">{new Date(p.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="p-3 text-right">
                  <Link to={`/admin/yazilar/${p.id}`} className="text-blue-600 mr-3">Düzenle</Link>
                  <button onClick={()=>del(p.id)} className="text-red-600">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

