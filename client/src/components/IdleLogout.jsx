import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { mustChangePassword } from '../auth'

export default function IdleLogout({ timeoutMs = 30 * 60 * 1000 }){
  const last = useRef(Date.now())
  const navigate = useNavigate()

  useEffect(()=>{
    const update = () => { last.current = Date.now() }
    const events = ['mousemove','mousedown','keydown','touchstart','scroll']
    events.forEach(ev => window.addEventListener(ev, update, { passive: true }))
    const t = setInterval(()=>{
      const token = localStorage.getItem('token')
      if (!token) return
      if (mustChangePassword(token)) return
      if (Date.now() - last.current > timeoutMs){
        localStorage.removeItem('token')
        navigate('/giris')
      }
    }, 60 * 1000)
    return () => {
      clearInterval(t)
      events.forEach(ev => window.removeEventListener(ev, update))
    }
  }, [timeoutMs])

  return null
}
