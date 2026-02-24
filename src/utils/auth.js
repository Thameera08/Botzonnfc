const TOKEN_KEY = 'nfc_admin_token'
const USER_KEY = 'nfc_admin_user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)

export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export const isAuthenticated = () => Boolean(getToken())

export const setAuthUser = (user) => {
  if (!user) return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const getAuthUser = () => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
