import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './services/auth'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import Preferences from './pages/Preferences'

// componente que protege rotas privadas
// se não estiver logado, redireciona para login
function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* rota raiz redireciona para feed se logado, login se não */}
        <Route path="/" element={<Navigate to={isAuthenticated() ? '/feed' : '/login'} />} />
        
        {/* rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* rotas privadas — só acessa com token */}
        <Route path="/feed" element={
          <PrivateRoute><Feed /></PrivateRoute>
        } />
        <Route path="/preferences" element={
          <PrivateRoute><Preferences /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}