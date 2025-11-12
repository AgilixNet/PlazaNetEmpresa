import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { perfilesService } from "../../services/perfilesService";
import { solicitudesService } from "../../services/solicitudesService";
import { 
  Users, 
  Building2, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock,
  Shield,
  UserCheck,
  BarChart3
} from "lucide-react";

export default function AdminSoftwareDashboard() {
  const [stats, setStats] = useState({
    usuarios: { total: 0, owners: 0, adminPlaza: 0, adminParqueadero: 0, arrendadores: 0, adminSoftware: 0 },
    solicitudes: { total: 0, pendientes: 0, aprobadas: 0, rechazadas: 0 },
    plazas: { total: 3 }, // Basado en PLAZAS constante
    crecimiento: { usuariosNuevos7dias: 0, solicitudesNuevas7dias: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usuariosData, solicitudesData] = await Promise.all([
        perfilesService.getAll().catch(e => {
          console.error('Error cargando usuarios:', e);
          return [];
        }),
        solicitudesService.getAll().catch(e => {
          console.error('Error cargando solicitudes:', e);
          return [];
        })
      ]);

      // Asegurar que los datos sean arrays
      const usuarios = Array.isArray(usuariosData) ? usuariosData : [];
      const solicitudes = Array.isArray(solicitudesData) ? solicitudesData : [];

      // Estadísticas de usuarios
      const usuariosStats = {
        total: usuarios.length,
        owners: usuarios.filter(u => u.rol === 'Owner').length,
        adminPlaza: usuarios.filter(u => u.rol === 'AdminPlaza').length,
        adminParqueadero: usuarios.filter(u => u.rol === 'ParkingAdmin').length,
        arrendadores: usuarios.filter(u => u.rol === 'Arrendador').length,
        adminSoftware: usuarios.filter(u => u.rol === 'AdminSoftware').length
      };

      // Estadísticas de solicitudes
      const solicitudesStats = {
        total: solicitudes.length,
        pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
        aprobadas: solicitudes.filter(s => s.estado === 'aprobada').length,
        rechazadas: solicitudes.filter(s => s.estado === 'rechazada').length
      };

      // Crecimiento (últimos 7 días)
      const hace7dias = new Date();
      hace7dias.setDate(hace7dias.getDate() - 7);

      const usuariosNuevos7dias = usuarios.filter(u => 
        u.created_at && new Date(u.created_at) >= hace7dias
      ).length;

      const solicitudesNuevas7dias = solicitudes.filter(s => 
        s.createdAt && new Date(s.createdAt) >= hace7dias
      ).length;

      setStats({
        usuarios: usuariosStats,
        solicitudes: solicitudesStats,
        plazas: { total: 3 },
        crecimiento: {
          usuariosNuevos7dias,
          solicitudesNuevas7dias
        }
      });

    } catch (err) {
      console.error("Error cargando datos del dashboard:", err);
      setError("No se pudieron cargar las estadísticas. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard - Admin Software">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard - Administración de Software">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
              <p className="text-indigo-100">Vista general del sistema PlazaNetEmpresa</p>
            </div>
            <Shield className="h-16 w-16 opacity-30" />
          </div>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Usuarios */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
                <p className="text-3xl font-bold text-gray-900">{stats.usuarios.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+{stats.crecimiento.usuariosNuevos7dias}</span>
              <span className="text-gray-500 ml-1">últimos 7 días</span>
            </div>
          </div>

          {/* Plazas Activas */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Plazas Activas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.plazas.total}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500">Paloquemao, 7 de Agosto, Restrepo</p>
          </div>

          {/* Solicitudes Pendientes */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Solicitudes Pendientes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.solicitudes.pendientes}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500">Requieren revisión</p>
          </div>

          {/* Total Solicitudes */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Solicitudes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.solicitudes.total}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+{stats.crecimiento.solicitudesNuevas7dias}</span>
              <span className="text-gray-500 ml-1">últimos 7 días</span>
            </div>
          </div>
        </div>

        {/* Desglose de Usuarios por Rol */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Usuarios por Rol</h2>
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold mr-3">
                    O
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Owners</p>
                    <p className="text-xs text-gray-500">Propietarios de plazas</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600">{stats.usuarios.owners}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
                    AP
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Admin Plaza</p>
                    <p className="text-xs text-gray-500">Administradores de plaza</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats.usuarios.adminPlaza}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold mr-3">
                    PK
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Admin Parqueadero</p>
                    <p className="text-xs text-gray-500">Gestión de parqueaderos</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats.usuarios.adminParqueadero}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold mr-3">
                    AR
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Arrendadores</p>
                    <p className="text-xs text-gray-500">Clientes de locales</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-orange-600">{stats.usuarios.arrendadores}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                    AS
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Admin Software</p>
                    <p className="text-xs text-gray-500">Equipo de desarrollo</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-indigo-600">{stats.usuarios.adminSoftware}</span>
              </div>
            </div>
          </div>

          {/* Estado de Solicitudes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Estado de Solicitudes</h2>
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-800">Pendientes</p>
                    <p className="text-xs text-gray-500">Requieren atención</p>
                  </div>
                </div>
                <span className="text-3xl font-bold text-yellow-600">{stats.solicitudes.pendientes}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-800">Aprobadas</p>
                    <p className="text-xs text-gray-500">Procesadas correctamente</p>
                  </div>
                </div>
                <span className="text-3xl font-bold text-green-600">{stats.solicitudes.aprobadas}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-800">Rechazadas</p>
                    <p className="text-xs text-gray-500">No aprobadas</p>
                  </div>
                </div>
                <span className="text-3xl font-bold text-red-600">{stats.solicitudes.rechazadas}</span>
              </div>

              {/* Tasa de aprobación */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Tasa de Aprobación</span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.solicitudes.total > 0 
                      ? Math.round((stats.solicitudes.aprobadas / stats.solicitudes.total) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: stats.solicitudes.total > 0 
                        ? `${(stats.solicitudes.aprobadas / stats.solicitudes.total) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin-software/usuarios"
              className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition"
            >
              <Users className="h-8 w-8 mr-3" />
              <div>
                <p className="font-semibold">Gestionar Usuarios</p>
                <p className="text-xs text-blue-100">Ver y administrar todos los usuarios</p>
              </div>
            </a>

            <a
              href="/admin-software/solicitudes"
              className="flex items-center p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white hover:from-green-600 hover:to-green-700 transition"
            >
              <FileText className="h-8 w-8 mr-3" />
              <div>
                <p className="font-semibold">Ver Solicitudes</p>
                <p className="text-xs text-green-100">Revisar solicitudes pendientes</p>
              </div>
            </a>

            <button
              onClick={loadDashboardData}
              className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white hover:from-purple-600 hover:to-purple-700 transition"
            >
              <TrendingUp className="h-8 w-8 mr-3" />
              <div>
                <p className="font-semibold">Actualizar Datos</p>
                <p className="text-xs text-purple-100">Refrescar estadísticas</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}