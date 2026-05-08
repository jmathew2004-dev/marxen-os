import axios from 'axios'

const defaultApiBaseUrl = import.meta.env.PROD
  ? 'https://api.osmarxen.com/api'
  : 'http://localhost:5001/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = String(error.config?.url || '').includes('/auth/')
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    if (error.code === 'ECONNABORTED') {
      error.response = {
        data: {
          error: 'The server took too long to respond. Please try again.'
        }
      }
    }
    if (!error.response) {
      error.response = {
        data: {
          error: `Cannot reach Marxen API at ${api.defaults.baseURL}. Please start the backend and try again.`
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
