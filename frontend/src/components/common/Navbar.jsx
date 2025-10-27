import { Bell, Settings, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ title = 'Dashboard' }) {
  const { perfil } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('es-CO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="h-6 w-6 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Settings className="h-6 w-6 text-gray-600" />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{perfil?.nombre || 'Usuario'}</p>
              <p className="text-xs text-gray-500 capitalize">
                {perfil?.rol?.replace('_', ' ') || 'Rol'}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}