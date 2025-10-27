import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  FileText, 
  DollarSign, 
  Car, 
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NAVEGACION } from '../../utils/constants';

const iconMap = {
  LayoutDashboard,
  Users,
  Store,
  FileText,
  DollarSign,
  Car,
  BarChart3
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { perfil, signOut } = useAuth();

  if (!perfil) return null;

  const menuItems = NAVEGACION[perfil.rol] || [];

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <aside className={`bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-xl font-bold">PlazaNetEmpresa</h2>
              <p className="text-xs text-slate-400 capitalize">{perfil.rol.replace('_', ' ')}</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = iconMap[item.icono];
          const isActive = location.pathname === item.ruta;

          return (
            <Link
              key={item.ruta}
              to={item.ruta}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={collapsed ? item.nombre : ''}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.nombre}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-700">
        {!collapsed && (
          <div className="mb-3 px-3">
            <p className="text-sm font-medium truncate">{perfil.nombre}</p>
            <p className="text-xs text-slate-400 truncate">
              {perfil.rol === 'owner' && 'Propietario'}
              {perfil.rol === 'admin_plaza' && 'Admin. Plaza'}
              {perfil.rol === 'admin_parqueadero' && 'Admin. Parqueadero'}
              {perfil.rol === 'arrendador' && 'Arrendador'}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
          title={collapsed ? 'Cerrar Sesión' : ''}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}