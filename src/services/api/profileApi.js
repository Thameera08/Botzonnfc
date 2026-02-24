import api from './client'

const normalizeProfile = (profile) => {
  if (!profile) return profile
  return { ...profile, id: profile.id || profile._id }
}

const normalizeProfileListPayload = (payload) => {
  const items = (payload?.items || payload?.profiles || []).map(normalizeProfile)
  return { ...payload, items }
}

export const getDashboard = async () => {
  const response = await api.get('/admin/dashboard')
  return response.data
}

export const getProfiles = async (params) => {
  const response = await api.get('/admin/profiles', { params })
  return normalizeProfileListPayload(response.data)
}

export const getProfileById = async (id) => {
  const response = await api.get(`/admin/profiles/${id}`)
  return normalizeProfile(response.data)
}

export const createProfile = async (payload) => {
  const response = await api.post('/admin/profiles', payload)
  return normalizeProfile(response.data)
}

export const updateProfile = async (id, payload) => {
  const response = await api.put(`/admin/profiles/${id}`, payload)
  return normalizeProfile(response.data)
}

export const updateProfileStatus = async (id, status) => {
  const response = await api.patch(`/admin/profiles/${id}/status`, { status })
  return normalizeProfile(response.data)
}

export const createProfileLogin = async (id, payload) => {
  const response = await api.post(`/admin/profiles/${id}/create-login`, payload)
  return response.data
}

export const getPublicProfile = async (username) => {
  const response = await api.get(`/profile/${username}`)
  return normalizeProfile(response.data)
}
