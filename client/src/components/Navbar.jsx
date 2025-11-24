import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { getRole, getName } from '../auth'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  const role = useMemo(() => getRole(token), [location, token])
  const name = useMemo(() => getName(token), [location, token])
  const isAuth = !!token
  const isAdmin = role === 'Admin'

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/giris')
  }

  const navLinkClass = ({ isActive }) =>
    `transition-colors hover:text-[hsl(var(--color-primary))] ${isActive ? 'text-[hsl(var(--color-primary))] font-medium' : 'text-[hsl(var(--color-text-secondary))]'
    }`

  return (
    <header className="sticky top-0 z-50 bg-[hsl(var(--color-surface))]/80 backdrop-blur-lg border-b border-[hsl(var(--color-border))] shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-sm">
              CC
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              CCNA Blog
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <NavLink to="/" className={navLinkClass}>Ana Sayfa</NavLink>
            <NavLink to="/kategoriler" className={navLinkClass}>Kategoriler</NavLink>
            <NavLink to="/hakkinda" className={navLinkClass}>Hakkında</NavLink>
            <NavLink to="/iletisim" className={navLinkClass}>İletişim</NavLink>

            {/* Search */}
            <form action="/ara" className="relative">
              <input
                name="q"
                className="input py-1.5 px-3 pr-8 text-sm w-48 focus:w-64 transition-all"
                placeholder="Ara..."
              />
              <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-tertiary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {!isAuth && (
              <>
                <NavLink to="/giris" className="btn btn-ghost text-sm">
                  Giriş
                </NavLink>
                <NavLink to="/kayit" className="btn btn-primary text-sm">
                  Kayıt Ol
                </NavLink>
              </>
            )}

            {isAuth && (
              <>
                {isAdmin && (
                  <NavLink to="/admin" className="btn btn-secondary text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin
                  </NavLink>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--color-bg-secondary))]">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {(name || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-[hsl(var(--color-text))]">{name || 'Üye'}</span>
                </div>
                <button onClick={logout} className="btn btn-ghost text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Çıkış
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg hover:bg-[hsl(var(--color-bg-secondary))] transition-colors"
              onClick={() => setOpen(o => !o)}
              aria-label="Menüyü aç/kapat"
            >
              {open ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] animate-slide-down">
          <div className="container-custom py-4 flex flex-col gap-3">
            {/* Search Mobile */}
            <form action="/ara" className="relative">
              <input
                name="q"
                className="input py-2 px-3 pr-10 text-sm w-full"
                placeholder="Ara..."
              />
              <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-tertiary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>

            <div className="flex flex-col gap-1">
              <NavLink onClick={() => setOpen(false)} to="/" className={({ isActive }) => `py-2 px-3 rounded-lg transition-colors ${isActive ? 'bg-[hsl(var(--color-bg-secondary))] text-[hsl(var(--color-primary))] font-medium' : 'text-[hsl(var(--color-text-secondary))] hover:bg-[hsl(var(--color-bg-secondary))]'}`}>
                Ana Sayfa
              </NavLink>
              <NavLink onClick={() => setOpen(false)} to="/kategoriler" className={({ isActive }) => `py-2 px-3 rounded-lg transition-colors ${isActive ? 'bg-[hsl(var(--color-bg-secondary))] text-[hsl(var(--color-primary))] font-medium' : 'text-[hsl(var(--color-text-secondary))] hover:bg-[hsl(var(--color-bg-secondary))]'}`}>
                Kategoriler
              </NavLink>
              <NavLink onClick={() => setOpen(false)} to="/hakkinda" className={({ isActive }) => `py-2 px-3 rounded-lg transition-colors ${isActive ? 'bg-[hsl(var(--color-bg-secondary))] text-[hsl(var(--color-primary))] font-medium' : 'text-[hsl(var(--color-text-secondary))] hover:bg-[hsl(var(--color-bg-secondary))]'}`}>
                Hakkında
              </NavLink>
              <NavLink onClick={() => setOpen(false)} to="/iletisim" className={({ isActive }) => `py-2 px-3 rounded-lg transition-colors ${isActive ? 'bg-[hsl(var(--color-bg-secondary))] text-[hsl(var(--color-primary))] font-medium' : 'text-[hsl(var(--color-text-secondary))] hover:bg-[hsl(var(--color-bg-secondary))]'}`}>
                İletişim
              </NavLink>
            </div>

            {!isAuth && (
              <div className="flex flex-col gap-2 pt-3 border-t border-[hsl(var(--color-border))]">
                <NavLink onClick={() => setOpen(false)} to="/giris" className="btn btn-ghost justify-start">
                  Giriş
                </NavLink>
                <NavLink onClick={() => setOpen(false)} to="/kayit" className="btn btn-primary justify-start">
                  Kayıt Ol
                </NavLink>
              </div>
            )}

            {isAuth && (
              <div className="flex flex-col gap-2 pt-3 border-t border-[hsl(var(--color-border))]">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--color-bg-secondary))]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {(name || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{name || 'Üye'}</span>
                </div>
                {isAdmin && (
                  <NavLink onClick={() => setOpen(false)} to="/admin" className="btn btn-secondary justify-start">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Paneli
                  </NavLink>
                )}
                <button onClick={() => { setOpen(false); logout() }} className="btn btn-ghost justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
