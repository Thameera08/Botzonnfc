import api from './client'

export const login = async (payload) => {
  const response = await api.post('/admin/login', payload)
  return response.data
}
