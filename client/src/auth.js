export function parseJwt(token){
  try{
    return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))
  }catch{
    return {}
  }
}

export function getRole(token){
  const p = parseJwt(token || '')
  return p.role || p["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || ''
}

export function getName(token){
  const p = parseJwt(token || '')
  return p.name || p["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || p.email || ''
}

export function mustChangePassword(token){
  const p = parseJwt(token || '')
  const v = p.mcp
  return v === true || v === 'true'
}
