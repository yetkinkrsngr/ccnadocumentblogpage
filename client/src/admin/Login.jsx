import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try{
      const res = await api.post('/auth/login', { username, password })
      localStorage.setItem('token', res.data.token)
      navigate('/admin')
    }catch(err){
      setError('Giriş başarısız. Kullanıcı adı veya şifre hatalı.')
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Admin Girişi</h1>
      <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow-soft space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Kullanıcı adı</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="admin" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Şifre</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Admin123!" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Giriş Yap</button>
      </form>
    </div>
  )
}

