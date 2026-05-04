import axios from 'axios'

// instância do axios com a URL base do backend
// quando fizer deploy, só muda aqui
const api = axios.create({
  baseURL: 'http://localhost:8000'
})

// interceptor — antes de cada requisição,
// pega o token salvo no localStorage e coloca no header automaticamente
// assim não precisa mandar o token manualmente em cada chamada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api