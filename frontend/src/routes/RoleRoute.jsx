import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RUTAS_POR_ROL } from '../utils/constants';

export default function RoleRoute({ children, rolesPermitidos = [] }) {
  const { perfil, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return <Navigate to="/login" replace />;
  }

  // Si no se especifican roles, permitir todos los autenticados
  if (rolesPermitidos.length === 0) {
    return children;
  }

  // Verificar si el rol del usuario está en los roles permitidos
  if (!rolesPermitidos.includes(perfil.rol)) {
    // Redirigir al dashboard correspondiente del usuario
    const dashboardUrl = RUTAS_POR_ROL[perfil.rol] || '/login';
    return <Navigate to={dashboardUrl} replace />;
  }

  return children;
}