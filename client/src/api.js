import axios from 'axios'

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5153/api'
// Boşluk ve sondaki eğik çizgileri temizle
const API_URL = String(RAW_API_URL).trim().replace(/\/+$/, '')

export const api = axios.create({
  baseURL: API_URL
})

// JWT için interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 için interceptor: tokenı temizle ve login'e yönlendir
api.interceptors.response.use(
  r => r,
  err => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token')
      if (typeof window !== 'undefined') window.location.href = '/admin/giris'
    }
    return Promise.reject(err)
  }
)

