import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function ChangePassword(){
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token){
      navigate('/giris', { replace: true })
    }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try{
      const res = await api.post('/auth/change-password', { currentPassword, newPassword })
      const { token } = res.data || {}
      if (token) {
        localStorage.setItem('token', token)
      }
      setSuccess('Şifre başarıyla güncellendi.')
      // Eğer admin ise admin paneline, değilse ana sayfaya gönder
      try{
        const payload = JSON.parse(atob(String(token || localStorage.getItem('token')).split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))
        const role = payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || ''
        if (role === 'Admin') navigate('/admin')
        else navigate('/')
      }catch{
        navigate('/')
      }
    }catch(err){
      setError(err?.response?.data?.message || 'Şifre değiştirilemedi. Bilgileri kontrol edin.')
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Şifre Değiştir</h1>
      <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow-soft space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Mevcut Şifre</label>
          <input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="••••••" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Yeni Şifre</label>
          <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="en az 6 karakter" required />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
        <button className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Kaydet</button>
      </form>
    </div>
  )
}

