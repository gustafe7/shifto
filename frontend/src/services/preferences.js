import api from './api'

// busca todas as preferências do usuário logado
export const getPreferences = async () => {
  const response = await api.get('/preferences/')
  return response.data
}

// adiciona uma nova preferência
export const addPreference = async (category, value) => {
  const response = await api.post('/preferences/', { category, value })
  return response.data
}

// remove uma preferência pelo ID
export const deletePreference = async (id) => {
  const response = await api.delete(`/preferences/${id}`)
  return response.data
}

// atualiza preferência de notificação por email
export const updateNotifications = async (emailNotifications) => {
  const response = await api.put('/preferences/notifications', {
    email_notifications: emailNotifications
  })
  return response.data
}

// busca as configurações do usuário
export const getSettings = async () => {
  const response = await api.get('/preferences/settings')
  return response.data
}