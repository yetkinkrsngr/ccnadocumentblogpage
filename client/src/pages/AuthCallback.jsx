import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function AuthCallback(){
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(()=>{
    const url = new URL(window.location.href)
    const token = url.searchParams.get('token') || ''
    if(token){
      localStorage.setItem('token', token)
      navigate('/')
    }else{
      navigate('/giris')
    }
  }, [])

  return <div>Giriş tamamlanıyor...</div>
}
