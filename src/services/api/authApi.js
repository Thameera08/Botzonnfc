import api from './client'

export const login = async (payload) => {
  const response = await api.post('/admin/login', payload)
  return response.data
}

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users')
  return response.data
}

export const createAdminUser = async (payload) => {
  const response = await api.post('/admin/users', payload)
  return response.data
}

export const updateAdminUserStatus = async (id, status) => {
  const response = await api.patch(`/admin/users/${id}/status`, { status })
  return response.data
}

export const updateAdminUser = async (id, payload) => {
  const response = await api.put(`/admin/users/${id}`, payload)
  return response.data
}

export const resetAdminUserPassword = async (id, password) => {
  const response = await api.patch(`/admin/users/${id}/password`, { password })
  return response.data
}
