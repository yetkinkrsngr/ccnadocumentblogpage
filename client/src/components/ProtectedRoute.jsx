import { Navigate } from 'react-router-dom'

function getRoleFromToken(token){
  try{
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))
    // .NET bazen claimTypes.role ve/veya "role" üretir
    return payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || ''
  }catch{
    return ''
  }
}

export default function ProtectedRoute({ children }){
  const token = localStorage.getItem('token')
  if(!token) return <Navigate to="/admin/giris" replace />
  const role = getRoleFromToken(token)
  if(role !== 'Admin') return <Navigate to="/admin/giris" replace />
  return children
}

