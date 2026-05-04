import api from './api'

// chama o endpoint de registro e retorna os dados
export const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password })
  return response.data
}

// chama o endpoint de login, salva o token no localStorage e retorna
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  localStorage.setItem('token', response.data.access_token)
  return response.data
}

// remove o token — desloga o usuário
export const logout = () => {
  localStorage.removeItem('token')
}

// verifica se tem token salvo — usuário está logado?
export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}