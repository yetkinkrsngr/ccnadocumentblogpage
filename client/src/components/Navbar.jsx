import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'

import { useMemo, useState } from 'react'
import { getRole, getName } from '../auth'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  const role = useMemo(()=>getRole(token), [location, token])
  const name = useMemo(()=>getName(token), [location, token])
  const isAuth = !!token
  const isAdmin = role === 'Admin'

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/giris')
  }

  return (
    <header className="bg-white/80 backdrop-blur sticky top-0 z-40 border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold tracking-tight">CCNA Blog</Link>
        <button className="md:hidden p-2 rounded border" onClick={()=>setOpen(o=>!o)} aria-label="Menüyü aç/kapat">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLink to="/" className={({isActive})=>`hover:text-blue-600 ${isActive?'text-blue-600':'text-gray-700'}`}>Ana Sayfa</NavLink>
          <NavLink to="/kategoriler" className={({isActive})=>`hover:text-blue-600 ${isActive?'text-blue-600':'text-gray-700'}`}>Kategoriler</NavLink>
          <NavLink to="/hakkinda" className={({isActive})=>`hover:text-blue-600 ${isActive?'text-blue-600':'text-gray-700'}`}>Hakkında</NavLink>
          <NavLink to="/iletisim" className={({isActive})=>`hover:text-blue-600 ${isActive?'text-blue-600':'text-gray-700'}`}>İletişim</NavLink>
          <form action="/ara" className="relative">
            <input name="q" className="border rounded-lg px-3 py-1 text-sm" placeholder="Ara..." />
          </form>
          {!isAuth && (
            <>
              <NavLink to="/giris" className={({isActive})=>`hover:text-blue-600 ${isActive?'text-blue-600':'text-gray-700'}`}>Giriş</NavLink>
              <NavLink to="/kayit" className={({isActive})=>`hover:text-blue-600 ${isActive?'text-blue-600':'text-gray-700'}`}>Kayıt</NavLink>
            </>
          )}
          {isAuth && (
            <>
              {isAdmin && (
                <NavLink to="/admin" className={({isActive})=>`hover:text-blue-600 ${isActive?'text-blue-600':'text-gray-700'}`}>Admin</NavLink>
              )}
              <span className="text-gray-600">Merhaba, {name || 'Üye'}</span>
              <button onClick={logout} className="px-3 py-1 rounded border hover:bg-gray-50">Çıkış</button>
            </>
          )}
        </nav>
      </div>
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-2 text-sm">
            <NavLink onClick={()=>setOpen(false)} to="/" className={({isActive})=>`py-1 ${isActive?'text-blue-600':'text-gray-700'}`}>Ana Sayfa</NavLink>
            <NavLink onClick={()=>setOpen(false)} to="/kategoriler" className={({isActive})=>`py-1 ${isActive?'text-blue-600':'text-gray-700'}`}>Kategoriler</NavLink>
            <NavLink onClick={()=>setOpen(false)} to="/hakkinda" className={({isActive})=>`py-1 ${isActive?'text-blue-600':'text-gray-700'}`}>Hakkında</NavLink>
            <NavLink onClick={()=>setOpen(false)} to="/iletisim" className={({isActive})=>`py-1 ${isActive?'text-blue-600':'text-gray-700'}`}>İletişim</NavLink>
            {!isAuth && (
              <>
                <NavLink onClick={()=>setOpen(false)} to="/giris" className={({isActive})=>`py-1 ${isActive?'text-blue-600':'text-gray-700'}`}>Giriş</NavLink>
                <NavLink onClick={()=>setOpen(false)} to="/kayit" className={({isActive})=>`py-1 ${isActive?'text-blue-600':'text-gray-700'}`}>Kayıt</NavLink>
              </>
            )}
            {isAuth && (
              <>
                {isAdmin && (
                  <NavLink onClick={()=>setOpen(false)} to="/admin" className={({isActive})=>`py-1 ${isActive?'text-blue-600':'text-gray-700'}`}>Admin</NavLink>
                )}
                <span className="py-1 text-gray-600">Merhaba, {name || 'Üye'}</span>
                <button onClick={()=>{ setOpen(false); logout() }} className="py-1 text-left">Çıkış</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

