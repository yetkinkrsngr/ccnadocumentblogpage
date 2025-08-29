import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try{
      const res = await api.post('/auth/login-email', { email, password })
      const { token, mustChangePassword } = res.data || {}
      localStorage.setItem('token', token)
      if (mustChangePassword) {
        navigate('/sifre-degistir')
        return
      }
      // role'a göre yönlendir
      let role = ''
      try{
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))
        role = payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || ''
      }catch{}
      if (role === 'Admin') navigate('/admin')
      else navigate('/')
    }catch(err){
      setError('Giriş başarısız. E-posta veya şifre hatalı.')
    }
  }

  const base = window.location.origin
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5153/api').trim().replace(/\/+$/, '')
  const toGoogle = () => {
    window.location.href = `${apiBase}/auth/oauth/google/login?redirectUri=${encodeURIComponent(base + '/auth/callback')}`
  }
  const toGitHub = () => {
    window.location.href = `${apiBase}/auth/oauth/github/login?redirectUri=${encodeURIComponent(base + '/auth/callback')}`
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Giriş Yap</h1>
      <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow-soft space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">E-posta</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="mail@ornek.com" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Şifre</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="••••••" required />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Giriş Yap</button>
      </form>
      <div className="bg-white p-6 rounded-xl shadow-soft mt-4 space-y-3">
        <button onClick={toGoogle} className="w-full px-4 py-2 rounded-lg border hover:bg-gray-50">Google ile devam et</button>
        <button onClick={toGitHub} className="w-full px-4 py-2 rounded-lg border hover:bg-gray-50">GitHub ile devam et</button>
        <p className="text-sm text-gray-600">Hesabın yok mu? <a className="text-blue-600" href="/kayit">Kayıt ol</a></p>
      </div>
    </div>
  )
}
