import { Navigate } from 'react-router-dom'

function parseJwt(token){
  try{
    return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))
  }catch{
    return {}
  }
}

function getRoleFromToken(token){
  const payload = parseJwt(token)
  return payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || ''
}

function mustChangePassword(token){
  const payload = parseJwt(token)
  const v = payload.mcp
  return v === true || v === 'true'
}

export default function ProtectedRoute({ children }){
  const token = localStorage.getItem('token')
  if(!token) return <Navigate to="/giris" replace />
  if(mustChangePassword(token)) return <Navigate to="/sifre-degistir" replace />
  const role = getRoleFromToken(token)
  if(role !== 'Admin') return <Navigate to="/giris" replace />
  return children
}

