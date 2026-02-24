import axios from 'axios'
import { clearAuth, getToken } from '../../utils/auth'
import { endRequest, startRequest } from '../../utils/requestLoader'

const resolveBaseUrl = () => {
  const configured = import.meta.env.VITE_API_BASE_URL

  if (!configured) return '/api'

  if (typeof window !== 'undefined') {
    const isHosted = !['localhost', '127.0.0.1'].includes(window.location.hostname)
    const pointsToLocalhost = configured.includes('localhost') || configured.includes('127.0.0.1')

    if (isHosted && pointsToLocalhost) {
      return '/api'
    }
  }

  return configured
}

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  startRequest()
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    endRequest()
    return response
  },
  (error) => {
    endRequest()
    if (error.response?.status === 401) {
      clearAuth()
    }

    return Promise.reject(error)
  },
)

export default api
