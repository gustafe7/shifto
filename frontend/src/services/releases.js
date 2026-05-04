import api from './api'

// busca o feed de lançamentos personalizado do usuário logado
export const getReleases = async () => {
  const response = await api.get('/releases/')
  return response.data
}