import api from './api'

// registra o usuário e envia preferência de notificação por email
// emailNotifications padrão true — usuário aceita notificações ao se cadastrar
export const register = async (name, email, password, emailNotifications = true) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
    // snake_case porque é o padrão do Python/FastAPI
    email_notifications: emailNotifications
  })
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