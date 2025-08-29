import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Register(){
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try{
      const res = await api.post('/auth/register', { email, password, displayName })
      localStorage.setItem('token', res.data.token)
      navigate('/')
    }catch(err){
      const msg = err?.response?.data?.message || 'Kayıt başarısız.'
      setError(msg)
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Kayıt Ol</h1>
      <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow-soft space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Adınız</label>
          <input value={displayName} onChange={e=>setDisplayName(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Örn. Ahmet" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">E-posta</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="mail@ornek.com" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Şifre</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="En az 6 karakter" required />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Kayıt Ol</button>
      </form>
      <p className="text-sm text-gray-600 mt-4">Zaten hesabın var mı? <a className="text-blue-600" href="/giris">Giriş yap</a></p>
    </div>
  )
}
