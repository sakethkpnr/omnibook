import axios from 'axios'

// For local dev: /api (proxied). For production (S3): set via setApiBaseUrl from config.json
const api = axios.create({
  baseURL: typeof window !== 'undefined' && window.__API_BASE_URL__ ? window.__API_BASE_URL__ : '/api',
  headers: { 'Content-Type': 'application/json' },
})

/** Call after loading config.json in production (S3) so API requests go to ALB */
export function setApiBaseUrl(url) {
  if (url) api.defaults.baseURL = url.replace(/\/$/, '') + '/api'
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // If we're sending FormData (e.g. image upload), let the browser
  // set the correct multipart boundary instead of forcing JSON.
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type']
      delete config.headers['content-type']
    }
  }

  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
